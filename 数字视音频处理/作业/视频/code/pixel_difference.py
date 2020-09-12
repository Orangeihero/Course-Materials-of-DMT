import os
import cv2
import numpy as np

#统计相邻图像帧对应像素变化超过设定的第一个阈值的像素点个数
def getPixelNumber(shot_dir,image_list):
    pixelNumber_list = []
    for i in range(len(image_list)-1):
        original_image1 = cv2.imread(shot_dir + image_list[i])
        image1 = original_image1.copy()
        image1 = cv2.cvtColor(image1,cv2.COLOR_BGR2GRAY)

        original_image2 = cv2.imread(shot_dir + image_list[i + 1])
        image2 = original_image2.copy()
        image2 = cv2.cvtColor(image2, cv2.COLOR_BGR2GRAY)

        pixel_difference = image2 - image1
        pixelNumber_list.append(len(pixel_difference[pixel_difference >= 100]))
    print(pixelNumber_list)
    return pixelNumber_list

# 图像像素差法
def pixelDifferenceDetect(shot_dir,result_dir):
    image_list = os.listdir(shot_dir)
    pixelNumber_list = getPixelNumber(shot_dir,image_list)
    e = cv2.imread(shot_dir+image_list[0])
    h = e.shape[0]
    w = e.shape[1]
    threshold = h*w*0.5
    print(threshold)
    imageID_list = []
    # 将变化的像素点个数与第二个设定的阈值比较
    for i in range(len(pixelNumber_list)):
        if pixelNumber_list[i] > threshold:
            imageID_list.append(i+1)
            temp = cv2.imread(shot_dir+image_list[i+1])
            cv2.imwrite(result_dir+image_list[i+1],temp)
    return imageID_list


def main():
    # 镜头帧图片地址
    shot_dir = './image/shot/test/'
    # 检测出来的图片的存放目录
    result_dir = './image/result/pixel_difference/test/'
    # shot_dir = './image/shot/pikachu/'
    # result_dir = './image/result/pixel_difference/pikachu/'
    result_list = pixelDifferenceDetect(shot_dir,result_dir)
    print(result_list)
if __name__=="__main__":
    main()
