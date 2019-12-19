"""
import os
import cv2
import math
from google.cloud import storage as gcs
from tensorflow.keras.models import load_model
import numpy as np
from tensorflow.keras.preprocessing.image import img_to_array, load_img
from PIL import Image
import urllib.request
import json


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
        array.append(icon)


def inference(img_cv, isBoss):
    if isBoss:
        model_file_name = "BossIcon.h5"
    else:
        model_file_name = 'CharacterIcon.h5'

    model = load_model(model_file_name)

    img_nad = img_to_array(img_cv)/255
    img_nad = img_nad[None, ...]

    pred = model.predict(img_nad, batch_size=1, verbose=0)
    pred_label = np.argmax(pred[0])
    print('name:', pred_label)
    return pred_label
    # score = np.max(pred)
    # print('score:', score)


bucket_name = "redias-report.appspot.com"
fname = "test/ResultLog.png"
project_name = "redias-report"

client = gcs.Client(project_name)
bucket = client.get_bucket(bucket_name)
blob = gcs.Blob(fname, bucket)
blob.download_to_filename("img_file.jpg")
img_file = "img_file.jpg"

img = cv2.imread(img_file)
imgGray = cv2.imread(img_file, 0)

os.remove(img_file)

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
    icons = []
    makeIcon(icons, iconsContours, iconsGray)
    idList = []
    if len(icons) <= 5:
        for icon in icons:
            idList.insert(0, inference(icon, False))

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
    bossId = None
    if len(bossIcon) == 1:
        for icon in bossIcon:
            bossId = inference(icon, True)

    left = math.floor(x+w*0.31)
    top = math.floor(y+h*0.14)
    right = math.floor(left+w*0.19)
    bottom = math.floor(top+h*0.62)
    damageRect = img[top:bottom, left:right]
    cv2.imwrite("damage.jpg", damageRect)

    left = math.floor(x+w*0.78)
    top = math.floor(y+w*0.14)
    right = math.floor(left+w*0.19)
    bottom = math.floor(top+h*0.13)
    bossDamageRect = img[top:bottom, left:right]
    cv2.imwrite("bossDamage.jpg", bossDamageRect)

    damageBlob = bucket.blob("test/damage.jpg")
    bossDamageBlob = bucket.blob("test/bossDamage.jpg")
    damageBlob.upload_from_filename("damage.jpg")
    bossDamageBlob.upload_from_filename("bossDamage.jpg")

    os.remove("damage.jpg")
    os.remove("bossDamage.jpg")

    url = "https://asia-northeast1-redias-report.cloudfunctions.net/tesseract"
    data = {"folder": "test"}
    headers = {"Content-Type": "application/json"}

    req = urllib.request.Request(url, json.dumps(data).encode(), headers)
    try:
        with urllib.request.urlopen(req) as res:
            body = res.read()
            decoded = body.decode()
            result = json.loads(decoded)
            print(result)
            print(result["damage"])
            print(result["total"])
            print(result["boss"])
            print(bossId)
            print(idList)
    except urllib.error.HTTPError as err:
        print(err.code)
    except urllib.error.URLError as err:
        print(err.reason)

"""

"""import json
import math
import urllib.request
import numpy as np
import cv2
from PIL import Image
from google.cloud import storage as gcs
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from flask import Flask, jsonify, request, abort, Response

import time

def main(request):
  start = time.time()
   request_json = request.get_json()
   if request.args and 'folder' in request.args:
        folder = request.args.get('folder')
    elif request_json and 'folder' in request_json:
        folder = request_json['folder']
    else:
        abort(400)
  folder = request

  img_file = "img_file.jpg"
  # img_file = "/tmp/img_file.jpg"
  download("{}/report.jpg".format(folder), img_file)

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
    icons = []
    makeIcon(icons, iconsContours, iconsGray)

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

    idList = []
    if len(icons) <= 5:
      for icon in icons:
        idList.insert(0, inference(icon, False))
    else:
      abort(400)
    
    bossId = None
    if len(bossIcon) == 1:
      for icon in bossIcon:
        bossId = inference(icon, True)
    else:
      abort(400)

    left = math.floor(x+w*0.31)
    top = math.floor(y+h*0.14)
    right = math.floor(left+w*0.19)
    bottom = math.floor(top+h*0.62)
    damageRect = img[top:bottom, left:right]
    damage_file = "damage.jpg"
    # damage_file = "/tmp/damage.jpg"
    cv2.imwrite(damage_file, damageRect)

    left = math.floor(x+w*0.78)
    top = math.floor(y+w*0.14)
    right = math.floor(left+w*0.19)
    bottom = math.floor(top+h*0.13)
    bossDamageRect = img[top:bottom, left:right]
    bossDamage_file = "bossDamage.jpg"
    # bossDamage_file = "/tmp/bossDamage.jpg"
    cv2.imwrite(bossDamage_file, bossDamageRect)

    upload("{}/damage.jpg".format(folder), damage_file)
    upload("{}/bossDamage.jpg".format(folder), bossDamage_file)

    url = "https://asia-northeast1-redias-report.cloudfunctions.net/tesseract"
    data = {"folder": folder}
    headers = {"Content-Type": "application/json"}
    req = urllib.request.Request(url, json.dumps(data).encode(), headers)
    try:
      with urllib.request.urlopen(req) as res:
        body = res.read()
        decoded = body.decode()
        damages = json.loads(decoded)
        result = {
          "id": idList,
          "damage": damages["damage"],
          "total": damages["total"],
          "boss": {
            "id": bossId,
            "damage": damages["boss"]
          }
        }
        print(result)
        print(time.time()-start)
        # return jsonify(result)
    except urllib.error.HTTPError as err:
      print(err.code)
      abort(400)
    except urllib.error.URLError as err:
      print(err.reason)
      abort(400)
  else:
    abort(400)

def download(source, file):
  client = gcs.Client("redias-report")
  bucket = client.get_bucket("redias-report.appspot.com")
  blob = bucket.blob(source)
  blob.download_to_filename(file)

def upload(source, file):
  client = gcs.Client("redias-report")
  bucket = client.get_bucket("redias-report.appspot.com")
  blob = bucket.blob(source)
  blob.upload_from_filename(file)

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
    array.append(icon)

def inference(img_cv, isBoss):
  if isBoss:
    model_file_name = "BossIcon.h5"
    # model_file_name = "/tmp/BossIcon.h5"
    download("model/BossIcon.h5", model_file_name)
  else:
    model_file_name = 'CharacterIcon.h5'
    # model_file_name = '/tmp/CharacterIcon.h5'
    download("model/CharacterIcon.h5", model_file_name)

  model = load_model(model_file_name)

  img_nad = img_to_array(img_cv)/255
  img_nad = img_nad[None, ...]

  pred = model.predict(img_nad, batch_size=1, verbose=0)
  pred_label = np.argmax(pred[0])
  print('name:', pred_label)
  return pred_label.tolist()

main("test")"""
import json
import math
import urllib.request
import numpy as np
import cv2
from PIL import Image
from google.cloud import storage as gcs
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from flask import Flask, jsonify, request, abort, Response
from multiprocessing import Process, Manager
import time

def main(request):
    start = time.time()
    """
  request_json = request.get_json()
  if request.args and 'folder' in request.args:
    folder = request.args.get('folder')
  elif request_json and 'folder' in request_json:
    folder = request_json['folder']
  else:
    abort(400)
    """
    folder = request

    download_time = time.time()

    img_file = "report.jpg"

    files =  ["report.jpg", "BossIcon.h5", "CharacterIcon.h5"]
    count = 0
    process_list = []

    for file in files:
      if count == 0:
        process = Process(target=download, args=("{}/{}".format(folder, file), file))
      else:
        process = Process(target=download, args=("model/{}".format(file), file))
      process.start()
      process_list.append(process)
      count += 1
    
    for process in process_list:
      process.join()

    download_end = time.time()
    print(download_end-download_time)

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

        

        icon_dict = {}
        num = 0
        if len(icons) <= 5 and len(bossIcon) == 1:
            for icon in icons:
                icon_dict[num] = icon
                num += 1
            icon_dict[5] = bossIcon[0]

            manager = Manager()
            returned_dict = manager.dict()
            process_list = []
            for i in range(6):
                process = Process(target=inference, args=(i, icon_dict[i], returned_dict))
                process.start()
                process_list.append(process)
            
            for process in process_list:
              process.join()
        else:
            abort(400)
        
        print(returned_dict)
        id_list = []
        for i in range(5):
          id_list.append(returned_dict[i])

        boss_id = returned_dict[5]

        left = math.floor(x+w*0.31)
        top = math.floor(y+h*0.14)
        right = math.floor(left+w*0.19)
        bottom = math.floor(top+h*0.62)
        damageRect = img[top:bottom, left:right]
        damage_file = "damage.jpg"
        # damage_file = "/tmp/damage.jpg"
        cv2.imwrite(damage_file, damageRect)

        left = math.floor(x+w*0.78)
        top = math.floor(y+w*0.14)
        right = math.floor(left+w*0.19)
        bottom = math.floor(top+h*0.13)
        bossDamageRect = img[top:bottom, left:right]
        bossDamage_file = "bossDamage.jpg"
        # bossDamage_file = "/tmp/bossDamage.jpg"
        cv2.imwrite(bossDamage_file, bossDamageRect)

        upload("{}/damage.jpg".format(folder), damage_file)
        upload("{}/bossDamage.jpg".format(folder), bossDamage_file)

        url = "https://asia-northeast1-redias-report.cloudfunctions.net/tesseract"
        data = {"folder": folder}
        headers = {"Content-Type": "application/json"}
        req = urllib.request.Request(url, json.dumps(data).encode(), headers)
        try:
            with urllib.request.urlopen(req) as res:
                body = res.read()
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
                print(result)
                print(time.time()-start)
                # return jsonify(result)
        except urllib.error.HTTPError as err:
            print(err.code)
            abort(400)
        except urllib.error.URLError as err:
            print(err.reason)
            abort(400)
    else:
        abort(400)


def download(source, file):
    client = gcs.Client("redias-report")
    bucket = client.get_bucket("redias-report.appspot.com")
    blob = bucket.blob(source)
    blob.download_to_filename(file)


def upload(source, file):
    client = gcs.Client("redias-report")
    bucket = client.get_bucket("redias-report.appspot.com")
    blob = bucket.blob(source)
    blob.upload_from_filename(file)


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
    print(num)
    if num == 5:
        model_file_name = "BossIcon.h5"
    else:
        model_file_name = 'CharacterIcon.h5'

    model = load_model(model_file_name)

    img_nad = img_to_array(icon)/255
    img_nad = img_nad[None, ...]

    pred = model.predict(img_nad, batch_size=1, verbose=0)
    pred_label = np.argmax(pred[0])
    print('name:', pred_label)
    result[num] = pred_label.tolist()


if __name__ == "__main__":
  main("test")