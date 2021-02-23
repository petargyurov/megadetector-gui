"""
Adapted from https://github.com/microsoft/CameraTraps/blob/master/detection/run_tf_detector.py

The functionality of the TFDetector class remains mostly the same with the biggest
change being that the class now has it's own method to run the model on some data.
"""
import uuid
import copy
import itertools
import json
import logging
import os
from datetime import datetime
from functools import partial
from multiprocessing.pool import Pool as workerpool
import sys
import click
import numpy as np

import tensorflow.python.util.deprecation as deprecation
deprecation._PRINT_DEPRECATION_WARNINGS = False

import tensorflow.compat.v1 as tf
import viz_utils


from utils import chunk_list, find_images, load_image, truncate_float
from annotation_constants import detector_bbox_category_id_to_name

tf.disable_v2_behavior()

logging.basicConfig(
    stream=sys.stdout,
    format='%(asctime)s.%(msecs)06d: %(levelname)s - %(message)s',
    datefmt='%Y-%d-%m %I:%M:%S', level=logging.INFO)


class TFDetector(object):
    """
    A detector model loaded at the time of initialization. It is intended to be used with
    the MegaDetector (TF).


    e inference batch size is set to 1; code needs to be modified
    to support larger batch sizes, including resizing appropriately.
    """

    def __init__(self, model_path, output_path, conf_digits=3, coord_digits=4,
                 render_conf_threshold=0.85, output_conf_threshold=0.1):

        """Loads model from model_path and starts a tf.Session with this graph. Obtains
        input and output tensor handles."""

        if not os.path.exists(output_path):
            os.makedirs(output_path)

        self.output_path = output_path

        # Number of decimal places to round to for confidence and bbox coordinates
        self.conf_digits = conf_digits
        self.coord_digits = coord_digits
        self.render_conf_threshold = render_conf_threshold  # to render bounding boxes
        self.output_conf_threshold = output_conf_threshold  # to include in the output json file

        self.label_map = {
            '1': 'animal',
            '2': 'person',
            '3': 'vehicle'  # available in MegaDetector v4+
        }

        detection_graph = self.__load_model(model_path)
        self.tf_session = tf.Session(graph=detection_graph)

        self.image_tensor = detection_graph.get_tensor_by_name('image_tensor:0')
        self.box_tensor = detection_graph.get_tensor_by_name(
            'detection_boxes:0')
        self.score_tensor = detection_graph.get_tensor_by_name(
            'detection_scores:0')
        self.class_tensor = detection_graph.get_tensor_by_name(
            'detection_classes:0')

    def run_detection(self, input_path, generate_bbox_images=True, recursive=False,
                      n_cores=0, results=None, checkpoint_path=None,
                      checkpoint_frequency=-1, electron=False):

        image_file_names = find_images(input_path, recursive=recursive)

        if results is None:
            results = []

        already_processed = set([i['file'] for i in results])

        gpu_available = True if tf.config.list_physical_devices(
            'GPU') else False

        if n_cores > 1 and gpu_available:
            logging.warning('Multiple cores requested, but a GPU is available; '
                            'parallelization across GPUs is not currently '
                            'supported, defaulting to one GPU')

        # If we're not using multiprocessing...
        if n_cores <= 1 or gpu_available:
            count = 0  # Does not count those already processed
            # Note: stylising the bar with custom characters breaks in Electron; need to investigate
            with click.progressbar(length=len(image_file_names),
                                   label='Processing Images',
                                   show_pos=True, show_eta=True,
                                   show_percent=True, info_sep='|') as bar:
                for im_file in image_file_names:
                    # Will not add additional entries not in the starter checkpoint
                    if im_file in already_processed:
                        logging.info(
                            f'Bypassing already processed image: {im_file}')
                        continue

                    count += 1

                    result = self.__process_image(im_file, generate_bbox_images)
                    results.append(result)
                    bar.update(1)

                    # this is for megadetector-gui usage
                    if electron:
                        print(bar.format_progress_line(), flush=True)

                    # checkpoint
                    if checkpoint_frequency != -1 and count % checkpoint_frequency == 0:
                        logging.info(f'Writing a new checkpoint after having '
                                     f'processed {count} images since last restart')
                        with open(checkpoint_path, 'w') as f:
                            json.dump({'images': results}, f)

        else:
            # when using multiprocessing, let the workers load the model
            logging.info(f'Creating pool with {n_cores} cores')

            if len(already_processed) > 0:
                logging.warning(
                    'When using multiprocessing, all images are reprocessed')

            pool = workerpool(n_cores)

            image_batches = list(chunk_list(image_file_names, n_cores))
            results = pool.map(partial(self.__process_images, image_batches),
                               image_batches, generate_bbox_images)
            results = list(itertools.chain.from_iterable(results))

        self.save(results)

        return results

    def __process_image(self, im_file, generate_bbox_images):
        try:
            image = load_image(im_file)
        except Exception as e:
            logging.error(f'Image {im_file} cannot be loaded. Exception: {e}')
            result = {
                'file'   : im_file,
                'failure': 'Failure image access'
            }
            return result

        try:
            result = self.generate_detections_one_image(image, im_file, generate_bbox_images)
            return result
        except Exception as e:
            logging.error(f'Image {im_file} cannot be loaded. Exception: {e}')
            result = {
                'file'   : im_file,
                'failure': 'Failure image access'
            }
            return result

    def __process_images(self, im_files, generate_bbox_images):
        """Runs the MegaDetector over a list of image files.

        Args
        - im_files: list of str, paths to image files
        - tf_detector: TFDetector (loaded model) or str (path to .pb model file)
        - confidence_threshold: float, only detections above this threshold are returned

        Returns
        - results: list of dict, each dict represents detections on one image
            see the 'images' key in https://github.com/microsoft/CameraTraps/tree/master/api/batch_processing#batch-processing-api-output-format
        """

        results = []
        for im_file in im_files:
            results.append(
                self.__process_image(im_file, generate_bbox_images))
        return results

    def __convert_coords(self, tf_coords):
        """Converts coordinates from the model's output format [y1, x1, y2, x2] to the
        format used by our API and MegaDB: [x1, y1, width, height]. All coordinates
        (including model outputs) are normalized in the range [0, 1].

        Args:
            tf_coords: np.array of predicted bounding box coordinates from the TF detector,
                has format [y1, x1, y2, x2]

        Returns: list of Python float, predicted bounding box coordinates [x1, y1, width, height]
        """
        # change from [y1, x1, y2, x2] to [x1, y1, width, height]
        width = tf_coords[3] - tf_coords[1]
        height = tf_coords[2] - tf_coords[0]

        new = [tf_coords[1], tf_coords[0], width,
               height]  # must be a list instead of np.array

        # convert numpy floats to Python floats
        for i, d in enumerate(new):
            new[i] = truncate_float(float(d), precision=self.coord_digits)
        return new

    @staticmethod
    def convert_to_tf_coords(array):
        """From [x1, y1, width, height] to [y1, x1, y2, x2], where x1 is x_min, x2 is x_max

        This is an extraneous step as the model outputs [y1, x1, y2, x2] but were converted to the API
        output format - only to keep the interface of the sync API.
        """
        x1 = array[0]
        y1 = array[1]
        width = array[2]
        height = array[3]
        x2 = x1 + width
        y2 = y1 + height
        return [y1, x1, y2, x2]

    @staticmethod
    def __load_model(model_path):
        """Loads a detection model (i.e., create a graph) from a .pb file.

        Args:
            model_path: .pb file of the model.

        Returns: the loaded graph.
        """
        logging.info('Loading TensorFlow graph...')
        detection_graph = tf.Graph()
        with detection_graph.as_default():
            od_graph_def = tf.GraphDef()
            with tf.io.gfile.GFile(model_path, 'rb') as fid:
                serialized_graph = fid.read()
                od_graph_def.ParseFromString(serialized_graph)
                tf.import_graph_def(od_graph_def, name='')
        logging.info('Detection graph loaded')

        return detection_graph

    def _generate_detections_one_image(self, image):
        np_im = np.asarray(image, np.uint8)
        im_w_batch_dim = np.expand_dims(np_im, axis=0)

        # TODO: need to change the above line to the following if supporting a batch size > 1 and resizing to the same size
        # np_images = [np.asarray(image, np.uint8) for image in images]
        # images_stacked = np.stack(np_images, axis=0) if len(images) > 1 else np.expand_dims(np_images[0], axis=0)

        # performs inference
        box_tensor_out, score_tensor_out, class_tensor_out = self.tf_session.run(
            [self.box_tensor, self.score_tensor, self.class_tensor],
            feed_dict={self.image_tensor: im_w_batch_dim})

        return box_tensor_out, score_tensor_out, class_tensor_out

    def generate_detections_one_image(self, image, image_id, generate_bbox_images):
        """Apply the detector to an image.

        Args:
            image: the PIL Image object
            image_id: a path to identify the image; will be in the "file" field of the output object
            detection_threshold: confidence above which to include the detection proposal

        Returns:
        A dict with the following fields, see the 'images' key in https://github.com/microsoft/CameraTraps/tree/master/api/batch_processing#batch-processing-api-output-format
            - 'file' (always present)
            - 'max_detection_conf'
            - 'detections', which is a list of detection objects containing keys 'category', 'conf' and 'bbox'
            - 'failure'
        """
        result = {
            'file': image_id
        }
        try:
            b_box, b_score, b_class = self._generate_detections_one_image(image)

            # our batch size is 1; need to loop the batch dim if supporting batch size > 1
            boxes, scores, classes = b_box[0], b_score[0], b_class[0]

            detections_cur_image = []  # will be empty for an image with no confident detections
            max_detection_conf = 0.0
            for b, s, c in zip(boxes, scores, classes):
                if s > self.output_conf_threshold:
                    detection_entry = {
                        'id'      : str(uuid.uuid4())[:8],
                        'category': str(int(c)),
                        'label'   : detector_bbox_category_id_to_name[int(c)],
                        'conf'    : truncate_float(float(s),
                                                   precision=self.conf_digits),
                        'bbox'    : self.__convert_coords(b)
                    }
                    detections_cur_image.append(detection_entry)
                    if s > max_detection_conf:
                        max_detection_conf = s

            result['max_detection_conf'] = truncate_float(
                float(max_detection_conf),
                precision=self.conf_digits)
            result['detections'] = detections_cur_image

            image_with_bboxes = image.copy()
            viz_utils.render_detection_bounding_boxes(result['detections'],
                                                      image_with_bboxes,
                                                      label_map=self.label_map,
                                                      confidence_threshold=self.render_conf_threshold)

            if generate_bbox_images:
                # TODO: would like to improve this
                # Determine which folder the image should be saved in
                many = []
                for d in result['detections']:
                    if d['conf'] >= self.render_conf_threshold:
                        many.append(d['category'])

                if len(result['detections']) > 1:
                    if len(many) > 1:
                        category = 'multiple'
                    elif len(many) == 1:
                        category = self.label_map[many[0]]
                    else:
                        category = 'empty'
                elif len(result['detections']) == 1 and result['detections'][0]['conf'] >= self.render_conf_threshold:
                    category = self.label_map[result['detections'][0]['category']]
                else:
                    category = 'empty'

                save_dir = os.path.join(self.output_path, category)
                if not os.path.exists(save_dir):
                    os.makedirs(save_dir)

                image_with_bboxes.save(os.path.join(save_dir, os.path.basename(image_id)))
                result['preview'] = os.path.join(save_dir, os.path.basename(image_id))

        except Exception as e:
            result['failure'] = 'Failure TF inference'
            logging.error(
                f'Image {image_id} failed during inference. Exception: {e}')

        return result

    def save(self, results, relative_path_base=None):
        """Writes list of detection results to JSON output file. Format matches
        https://github.com/microsoft/CameraTraps/tree/master/api/batch_processing#batch-processing-api-output-format

        Args
        - results: list of dict, each dict represents detections on one image
        - output_file: str, path to JSON output file, should end in '.json'
        - relative_path_base: str, path to a directory as the base for relative paths
        """
        if relative_path_base is not None:
            results_relative = []
            for r in results:
                r_relative = copy.copy(r)
                r_relative['file'] = os.path.relpath(r_relative['file'],
                                                     start=relative_path_base)
                results_relative.append(r_relative)
            results = results_relative

        final_output = {
            'images'              : results,
            'detection_categories': self.label_map,
            'info'                : {
                'input_params': {
                    'render_conf_threshold': self.render_conf_threshold,
                    'output_conf_threshold': self.output_conf_threshold,
                    'conf_digits': self.conf_digits,
                    'coord_digits': self.coord_digits
                },
                'detection_completion_time': datetime.utcnow().strftime(
                    '%Y-%m-%d %H:%M:%S'),
                'format_version'           : '1.0'
            }
        }

        save_dir = os.path.join(self.output_path, 'results.json')
        with open(save_dir, 'w') as f:
            json.dump(final_output, f, indent=1)
        logging.info(f'Output file saved at {save_dir}')
