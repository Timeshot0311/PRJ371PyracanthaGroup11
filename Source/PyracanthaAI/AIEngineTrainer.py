# -*- coding: utf-8 -*-
"""
Created on Mon May  5 21:30:21 2025
@author: vusi
"""
from fontTools.misc.cython import returns
from ultralytics import YOLO
import subprocess
from zipfile import ZipFile
import wget
import argparse
import os
import shutil
from sklearn.model_selection import train_test_split
#from train_val_split import split_data
import yaml
import cv2

url = 'https://raw.githubusercontent.com/EdjeElectronics/Train-and-Deploy-YOLO-Models/refs/heads/main/utils/train_val_split.py'
destination_folder = 'data/train_val_split.py'

path_to_classes_txt = 'data/custom_data/classes.txt'
path_to_data_yaml = 'data.yaml'


def create_data_yaml(path_to_classes_txt, path_to_data_yaml):
    # Read class.txt to get class names
    if not os.path.exists(path_to_classes_txt):
        print(f'classes.txt file not found! Please create a classes.txt labelmap and move it to {path_to_classes_txt}')
        return
    with open(path_to_classes_txt, 'r') as f:
        classes = []
        for line in f.readlines():
            if len(line.strip()) == 0: continue
            classes.append(line.strip())
        number_of_classes = len(classes)

    # Create data dictionary
    data = {
        'path': 'data/',
        'train': 'train/images',
        'val': 'validation/images',
        'nc': number_of_classes,
        'names': classes
    }

    # Write data to YAML file
    with open(path_to_data_yaml, 'w') as f:
        yaml.dump(data, f, sort_keys=False)
        print(f'Created config file at {path_to_data_yaml}')
    return


try:
    subprocess.check_output('nvidia-smi')
    print('Nvidia GPU detected!')

    # loading the temp.zip and creating a zip object
    with ZipFile("samples/pyracantha_species_labelled.zip", 'r') as zObject:
        zObject.extractall(path="data/custom_data")

    wget.download(url, destination_folder)
    #split_data('data/custom_data', 0.8)
    subprocess.run([
        "python", "train_val_split.py",
        "--datapath", "data/custom_data",
        "--train_pct", "0.7"
    ])


    try:
        create_data_yaml(path_to_classes_txt, path_to_data_yaml)
        print('\nFile contents:\n')
        with open(path_to_data_yaml, 'r') as f:
            contents = f.read()
            print(contents)
    except FileNotFoundError:
        print(f"File not found: {path_to_data_yaml}")
    except Exception:
        print(f"File not found: {path_to_data_yaml}")

    try:
        # Load a model
        model = YOLO("yolov8n.pt")  # Use "yolov8s.pt" or your custom model

        # Train the model
        train_results = model.train(
            data="data.yaml",   # Path to your data.yaml
            epochs=60,          # Adjust as needed
            imgsz=640,      # Smaller image size = less VRAM usage 416,#
            batch=2,            # Keep batch size small for your GPU
            device="cuda:0",    # Use GPU explicitly
            amp=True,           # Enable mixed precision (lower memory use)
            workers=1,           # Lower workers if system RAM is low
            mosaic = 0.0,  # disables mosaic
            degrees = 0.0,  # disables rotation
            perspective = 0.0  # disables perspective warp
        )

        # Evaluate model performance on the validation set
        metrics = model.val()

        # Export the model
        #model.export(format="onnx")

    except RuntimeError:
        print(f"CUDA out of memory.")
    except RuntimeError:
        print(f"data.yaml not found.")
    except AssertionError:
        print(f"'train' key missing in data.yaml.")
    except Exception:
        print(f"AI training failed. Please check the logs and try again.")

except Exception:  # this command not being found can raise quite a few different errors depending on the configuration
    print('No Nvidia GPU in system!')


def split_data(datapath, train_pct):
    # Ensure the data path exists
    if not os.path.exists(datapath):
        raise FileNotFoundError(f"Data path '{datapath}' does not exist.")

    all_files = os.listdir(datapath)
    train_files, val_files = train_test_split(all_files, train_size=train_pct, random_state=42)

    train_dir = os.path.join(datapath, 'train')
    val_dir = os.path.join(datapath, 'val')
    os.makedirs(train_dir, exist_ok=True)
    os.makedirs(val_dir, exist_ok=True)

    for f in train_files:
        shutil.move(os.path.join(datapath, f), os.path.join(train_dir, f))

    for f in val_files:
        shutil.move(os.path.join(datapath, f), os.path.join(val_dir, f))

    print(f"Moved {len(train_files)} files to {train_dir}")
    print(f"Moved {len(val_files)} files to {val_dir}")
    return



# if __name__ == "__main__":
#     parser = argparse.ArgumentParser()
#     parser.add_argument("--datapath", type=str, required=True, help="Path to the dataset directory")
#     parser.add_argument("--train_pct", type=float, default=0.7, help="Percentage of data to use for training")
#     args = parser.parse_args()
#
#     split_data(args.datapath, args.train_pct)
