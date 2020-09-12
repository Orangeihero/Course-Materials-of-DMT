import os
import cv2
import numpy as np

#得到带权重的直方图差
def getHist(shot_dir,image_list):
    hist_list = []
    for i in range(len(image_list)):
        original_image = cv2.imread(shot_dir+image_list[i])
        image = original_image.copy()
        image = cv2.GaussianBlur(image,(9,9),0)

        image = cv2.cvtColor(image,cv2.COLOR_BGR2HSV)
        h,s,v = cv2.split(image)

        # 计算直方图
        hist_h = cv2.calcHist([h],[0],None,[256],[0,255])
        hist_s = cv2.calcHist([s], [0], None, [256], [0, 255])
        hist_v = cv2.calcHist([v], [0], None, [256], [0, 255])
        hist = 0.5*hist_h + 0.3*hist_s + 0.2*hist_v
        hist_list.append(hist)

    return hist_list

#得到直方图差
def getDifference(image1_hist, image2_hist):
    difference = 0
    for i in range(256):
        difference += abs(image2_hist[i]-image1_hist[i])
    return difference

def twinComparisonDetect(shot_dir,result_dir):
    image_list = os.listdir(shot_dir)
    hist_list = getHist(shot_dir,image_list)
    difference_list = []
    for i in range(len(image_list)-1):
        difference = getDifference(hist_list[i], hist_list[i+1])
        difference_list.append(difference)
    Tb = 60000
    Ts = 20000
    imageID_list = []
    Fs = 0
    isFs = False

    # 处理双阈值
    for i in range(len(difference_list)):
        if difference_list[i] > Tb:
            imageID_list.append(i+1)
            temp = cv2.imread(shot_dir+image_list[i+1])
            cv2.imwrite(result_dir+image_list[i+1],temp)
        elif difference_list[i]>Ts:
            Fs = i
            isFs = True
        else:
            if isFs == True:
                isFs = False
                difference = getDifference(hist_list[Fs], hist_list[i])
                if difference > Tb:
                    imageID_list.append(Fs + 1)
                    temp = cv2.imread(shot_dir + image_list[Fs + 1])
                    cv2.imwrite(result_dir + image_list[Fs + 1], temp)

    return imageID_list


def main():
    # 镜头帧图片地址
    shot_dir = './image/shot/test/'
    # 检测出来的图片的存放目录
    result_dir = './image/result/twin_difference/test/'
    # shot_dir = './image/shot/pikachu/'
    # result_dir = './image/result/twin_difference/pikachu/'
    result_list = twinComparisonDetect(shot_dir,result_dir)
    print(result_list)
if __name__=="__main__":
    main()
