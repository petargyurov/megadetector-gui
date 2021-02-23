import sys
import os
import json
import click

from utils import save_as_csv


@click.group()
def mega():
    pass


# TODO: support for results field


@mega.command()
@click.argument('model-path')
@click.argument('input-path')
@click.argument('output-path')
@click.option('-rcf', '--round-conf', default=3, help='Number of decimal places to round confidence to')
@click.option('-rcd', '--round-coord', default=4, help='Number of decimal places to round bbox coordinates to')
@click.option('-rt', '--render-thresh', default=0.85, help='Minimum confidence value required to render a bbox')
@click.option('-ot', '--output-thresh', default=0.1, help='Minimum confidence value required to output a detection in the output file')
@click.option('--recursive/--not-recursive', default=False, help='Whether to search for images in folders within the base folder provided')
@click.option('-n', '--n-cores', default=0, help='Number of CPU cores to utilise. Will be ignored if a valid GPU is available')
@click.option('-cp', '--checkpoint-path', default=None, type=str, help='Path to JSON checkpoint file')
@click.option('-cf', '--checkpoint-frequency', default=-1, type=str, help='How often to write to checkpoint file, i.e.: every N images')
@click.option('--show/--no-show', default=False, help='Whether to output the results in the console')
@click.option('--bbox/--no-bbox', default=True, help='Whether save images with bounding boxes.')
@click.option('--verbose/--quiet', default=False, help='Whether to output or supress Tensorflow message')
@click.option('--electron/--no-electron', default=False, help='Whether we\'re calling this from Electron; stdout is handled differently')
@click.option('--auto-sort/--no-auto-sort', default=False, help='Whether to automatically move original images into categorised folders')
def detect(model_path, input_path, output_path, round_conf, round_coord, render_thresh,
           output_thresh, recursive, n_cores, checkpoint_path,
           checkpoint_frequency, show, bbox, verbose, electron, auto_sort):
    """Runs detection procedure on a set of images using a given
       MegaDetector model.


       MODEL_PATH: the path of the MegaDetector model file to use


       INPUT_PATH: the path of the image folder


       OUTPUT_PATH: path in which to save bbox images and JSON summary.
       """

    if not verbose:
        os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

    from tf_detector import TFDetector

    tf_detector = TFDetector(model_path=model_path,
                             output_path=output_path,
                             conf_digits=round_conf,
                             coord_digits=round_coord,
                             render_conf_threshold=render_thresh,
                             output_conf_threshold=output_thresh)

    results = tf_detector.run_detection(input_path=input_path,
                                        generate_bbox_images=bbox,
                                        recursive=recursive,
                                        n_cores=n_cores,
                                        results=None,
                                        checkpoint_path=checkpoint_path,
                                        checkpoint_frequency=checkpoint_frequency,
                                        electron=electron)

    if auto_sort:
        mega(["move", os.path.join(tf_detector.output_path, 'results.json'), "--auto-sort"])

    if show:
        click.echo_via_pager(
            json.dumps(r, indent=4, default=str) for r in results)


@mega.command()
@click.argument('results_path')
@click.option('--auto-sort/--no-auto-sort', default=False, help='Whether to automatically move original images into categorised folders')
def move(results_path, auto_sort):
    with open(results_path) as f:
        results = json.load(f)

    images = results['images']
    categories = results['detection_categories']

    try:
        save_as_csv(images)  # TODO: this really doesn't belong here
    except Exception:
        pass

    for img in images:
        if not img.get('reviewed') and not auto_sort:  # skip images that haven't been reviewed
            continue
        category = img['detections'][0]['category'] if img['detections'] else 0
        category = categories.get(category, 'empty')
        dest = os.path.join(os.path.dirname(img['file']), category)

        if not os.path.exists(dest):
            os.makedirs(dest)

        try:
            # move image
            os.rename(img['file'], os.path.join(dest, os.path.basename(img['file'])))
        except FileNotFoundError:
            continue


if getattr(sys, 'frozen', False):
    mega(sys.argv[1:])
