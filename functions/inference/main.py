import os
import json
import math
import requests
import numpy as np
import cv2
from PIL import Image
from google.cloud import storage as gcs
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from flask import Flask, jsonify, request, abort, Response
from multiprocessing import Process, Manager


def main(request):
    origin = request.headers.get("Origin")
    allow_origin = ["https://{}.web.app".format(os.environ["GCLOUD_STORAGE_PROJECT"]),
                    "https://{}.firebaseapp.com".format(os.environ["GCLOUD_STORAGE_PROJECT"])]
    if not origin in allow_origin:
        abort(400)

    file = request.files["file"]
    name = file.filename

    img_file = "/tmp/report.jpg"
    file.save(img_file)

    files = ["BossIcon.h5", "CharacterIcon.h5"]
    count = 0
    process_list = []

    for file in files:
        process = Process(target=download, args=(
            "model/{}".format(file), "/tmp/{}".format(file)))
        process.start()
        process_list.append(process)
        count += 1

    for process in process_list:
        process.join()

    img = cv2.imread(img_file)
    imgGray = cv2.imread(img_file, 0)

    ret, thresh = cv2.threshold(imgGray, 150, 255, cv2.THRESH_BINARY)
    contours, hierarchy = cv2.findContours(
        thresh, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    passing = 0
    passingNum = 0
    count = 0
    for cnt in contours:
        height, width, ch = img.shape[:3]
        area = cv2.contourArea(cnt)
        if area > height * width * 0.3:
            x, y, w, h = cv2.boundingRect(cnt)
            if 1.02 < h/w and h/w < 1.03:
                passing += 1
                passingNum = count
        count += 1

    if passing == 1:
        # icons
        x, y, w, h = cv2.boundingRect(contours[passingNum])
        left = math.floor(x+w*0.04)
        top = math.floor(y+h*0.14)
        right = math.floor(left+w*0.13)
        bottom = math.floor(top+h*0.62)
        iconsRect = img[top:bottom, left:right]
        iconsGray = cv2.cvtColor(iconsRect, cv2.COLOR_BGR2GRAY)
        ret, iconsThresh = cv2.threshold(
            iconsGray, 220, 255, cv2.THRESH_BINARY_INV)
        iconsContours, hierarchy = cv2.findContours(
            iconsThresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        # bossIcon
        left = math.floor(x+w*0.5)
        top = math.floor(y+w*0.14)
        right = math.floor(left+w*0.13)
        bottom = math.floor(top+w*0.13)
        bossIconRect = img[top:bottom, left:right]
        bossIconGray = cv2.cvtColor(bossIconRect, cv2.COLOR_BGR2GRAY)
        ret, bossIconThresh = cv2.threshold(
            bossIconGray, 220, 255, cv2.THRESH_BINARY_INV)
        bossIconContours, hierarchy = cv2.findContours(
            bossIconThresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        bossIcon = []
        makeIcon(bossIcon, bossIconContours, bossIconGray)

        icons = []
        makeIcon(icons, iconsContours, iconsGray)

        if len(icons) <= 5 and len(bossIcon) >= 1:
            manager = Manager()
            returned_dict = manager.dict()
            process_list = []
            for i in range(len(icons)):
                process = Process(target=inference, args=(
                    i, icons[i], returned_dict))
                process.start()
                process_list.append(process)
            process = Process(target=inference, args=(
                5, bossIcon[0], returned_dict))
            process.start()
            process_list.append(process)

            for process in process_list:
                process.join()
        else:
            abort(400)

        id_list = [None, None, None, None, None]
        for i in range(len(icons)):
            id_list[i] = returned_dict[i]

        boss_id = returned_dict[5]

        left = math.floor(x+w*0.31)
        top = math.floor(y+h*0.14)
        right = math.floor(left+w*0.19)
        bottom = math.floor(top+h*0.62)
        damageRect = img[top:bottom, left:right]
        damage_file = "/tmp/damage.jpg"
        cv2.imwrite(damage_file, damageRect)

        left = math.floor(x+w*0.78)
        top = math.floor(y+w*0.14)
        right = math.floor(left+w*0.19)
        bottom = math.floor(top+h*0.13)
        bossDamageRect = img[top:bottom, left:right]
        bossDamage_file = "/tmp/bossDamage.jpg"
        cv2.imwrite(bossDamage_file, bossDamageRect)

        url = os.environ["TESSERACT_FUNCTION"]
        data = {(damage_file, open(damage_file, "rb")),
                (bossDamage_file, open(bossDamage_file, "rb"))}
        res = requests.post(url, files=data)
        body = res.content
        decoded = body.decode()
        damages = json.loads(decoded)
        result = {
            "id": id_list,
            "damage": damages["damage"],
            "total": damages["total"],
            "boss": {
                "id": boss_id,
                "damage": damages["boss"]
            }
        }
        response = jsonify(result)
        response.headers.set('Access-Control-Allow-Origin', origin)
        response.headers.set('Access-Control-Allow-Methods', 'POST')
        return response

    else:
        abort(400)


def download(source, file):
    client = gcs.Client(os.environ["GCLOUD_STORAGE_PROJECT"])
    bucket = client.get_bucket(os.environ["GCLOUD_STORAGE_BUCKET"])
    blob = bucket.blob(source)
    blob.download_to_filename(file)


def makeIcon(array, contours, gray):
    for cnt in contours:
        iconX, iconY, iconW, iconH = cv2.boundingRect(cnt)
        padding = math.floor(iconW * 0.1)
        iconX += padding
        iconY += padding
        iconW -= padding * 2
        iconH = iconW
        icon = gray[iconY:iconY+iconH, iconX:iconX+iconW]
        icon = cv2.resize(icon, (76, 76))
        array.insert(0, icon)


def inference(num, icon, result):
    if num == 5:
        model_file_name = "/tmp/BossIcon.h5"
    else:
        model_file_name = '/tmp/CharacterIcon.h5'

    model = load_model(model_file_name)

    img_nad = img_to_array(icon)/255
    img_nad = img_nad[None, ...]

    pred = model.predict(img_nad, batch_size=1, verbose=0)
    pred_label = np.argmax(pred[0])
    result[num] = pred_label.tolist()


if __name__ == "__main__":
    app = Flask(__name__)

    @app.route('/')
    def index():
        return main(request)

    app.run('127.0.0.1', 8000, debug=True)
