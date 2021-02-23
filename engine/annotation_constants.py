"""
Taken from https://github.com/microsoft/CameraTraps/blob/9274b2b2c3b7675341c9d065d1782fc74c428943/data_management/annotations/annotation_constants.py
"""

NUM_DETECTOR_CATEGORIES = 3  # this is for choosing colors, so ignoring the "empty" class

# This is the label mapping used for our incoming iMerit annotations
# Only used to parse the incoming annotations. In our database, the string name is used to avoid confusion
annotation_bbox_categories = [
    {'id': 0, 'name': 'empty'},
    {'id': 1, 'name': 'animal'},
    {'id': 2, 'name': 'person'},
    {'id': 3, 'name': 'group'},  # group of animals
    {'id': 4, 'name': 'vehicle'}
]

annotation_bbox_category_id_to_name = {}
annotation_bbox_category_name_to_id = {}

for cat in annotation_bbox_categories:
    annotation_bbox_category_id_to_name[cat['id']] = cat['name']
    annotation_bbox_category_name_to_id[cat['name']] = cat['id']

# MegaDetector outputs
detector_bbox_categories = [
    {'id': 0, 'name': 'empty'},
    {'id': 1, 'name': 'animal'},
    {'id': 2, 'name': 'person'},
    {'id': 3, 'name': 'vehicle'}
]

detector_bbox_category_id_to_name = {}
detector_bbox_category_name_to_id = {}

for cat in detector_bbox_categories:
    detector_bbox_category_id_to_name[cat['id']] = cat['name']
    detector_bbox_category_name_to_id[cat['name']] = cat['id']