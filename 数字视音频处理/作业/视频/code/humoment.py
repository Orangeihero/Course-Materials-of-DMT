import os
import cv2
import numpy as np

def humoments(gray):
    row, col = gray.shape
    #计算图像的0阶几何矩
    m00 = gray.sum()
    m10 = m01 = 0
    #　计算图像的二阶、三阶几何矩
    m11 = m20 = m02 = m12 = m21 = m30 = m03 = 0
    for i in range(row):
        m10 += (i * gray[i]).sum()
        m20 += (i ** 2 * gray[i]).sum()
        m30 += (i ** 3 * gray[i]).sum()
        for j in range(col):
            m11 += i * j * gray[i][j]
            m12 += i * j ** 2 * gray[i][j]
            m21 += i ** 2 * j * gray[i][j]
    for j in range(col):
        m01 += (j * gray[:, j]).sum()
        m02 += (j ** 2 * gray[:, j]).sum()
        m30 += (j ** 3 * gray[:, j]).sum()
    # 由标准矩我们可以得到图像的"重心"
    u10 = m10 / m00
    u01 = m01 / m00
    # 计算图像的二阶中心矩、三阶中心矩
    y00 = m00
    y10 = y01 = 0
    y11 = m11 - u01 * m10
    y20 = m20 - u10 * m10
    y02 = m02 - u01 * m01
    y30 = m30 - 3 * u10 * m20 + 2 * u10 ** 2 * m10
    y12 = m12 - 2 * u01 * m11 - u10 * m02 + 2 * u01 ** 2 * m10
    y21 = m21 - 2 * u10 * m11 - u01 * m20 + 2 * u10 ** 2 * m01
    y03 = m03 - 3 * u01 * m02 + 2 * u01 ** 2 * m01
    # 计算图像的归格化中心矩
    n20 = y20 / m00 ** 2
    n02 = y02 / m00 ** 2
    n11 = y11 / m00 ** 2
    n30 = y30 / m00 ** 2.5
    n03 = y03 / m00 ** 2.5
    n12 = y12 / m00 ** 2.5
    n21 = y21 / m00 ** 2.5
    # 计算图像的七个不变矩
    h1 = n20 + n02
    h2 = (n20 - n02) ** 2 + 4 * n11 ** 2
    h3 = (n30 - 3 * n12) ** 2 + (3 * n21 - n03) ** 2
    h4 = (n30 + n12) ** 2 + (n21 + n03) ** 2
    h5 = (n30 - 3 * n12) * (n30 + n12) * ((n30 + n12) ** 2 - 3 * (n21 + n03) ** 2) + (3 * n21 - n03) * (n21 + n03) \
        * (3 * (n30 + n12) ** 2 - (n21 + n03) ** 2)
    h6 = (n20 - n02) * ((n30 + n12) ** 2 - (n21 + n03) ** 2) + 4 * n11 * (n30 + n12) * (n21 + n03)
    h7 = (3 * n21 - n03) * (n30 + n12) * ((n30 + n12) ** 2 - 3 * (n21 + n03) ** 2) + (3 * n12 - n30) * (n21 + n03) \
        * (3 * (n30 + n12) ** 2 - (n21 + n03) ** 2)
    inv_m7 = [h1, h2, h3, h4, h5, h6, h7]
    inv_m7 = np.log(np.abs(inv_m7)) # 取对数
    return inv_m7

#得到不变矩
def getHumoment(shot_dir):
    image_list = os.listdir(shot_dir)
    humoment_list = []
    for i in range(len(image_list)):
        original_img = cv2.imread(shot_dir+image_list[i])
        image = original_img.copy()
        gray = cv2.cvtColor(image,cv2.COLOR_BGR2GRAY)
        moments = cv2.moments(gray)
        humoments = cv2.HuMoments(moments)
        humoments = np.log(np.abs(humoments))
        humoment_list.append(humoments)

    return humoment_list


# 矩不变量法
def humomentDetect(shot_dir,result_dir):
    image_list = os.listdir(shot_dir)
    humoment_list = getHumoment(shot_dir)

    d = []
    for i in range(len(humoment_list)-1):
        #欧氏距离
        distance = (humoment_list[i][0] - humoment_list[i+1][0])**2 + (humoment_list[i][1] - humoment_list[i+1][1])**2 + (humoment_list[i][2] - humoment_list[i+1][2])**2
        d.append(distance)
        threshold = 10

    imageID_list = []
    for i in range(len(d)):
        if d[i] > threshold:
            imageID_list.append(i + 1)
            temp = cv2.imread(shot_dir + image_list[i + 1])
            cv2.imwrite(result_dir + image_list[i + 1], temp)
    return imageID_list


def main():
    #镜头帧图片地址
    shot_dir = './image/shot/test/'
    # 检测出来的图片的存放目录
    result_dir = './image/result/humoment/test/'
    # shot_dir = './image/shot/pikachu/'
    # result_dir = './image/result/humoment/pikachu/'
    result_list = humomentDetect(shot_dir,result_dir)
    print(result_list)
if __name__=="__main__":
    main()
