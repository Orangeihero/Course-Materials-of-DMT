import cv2

#得到视频的每一帧，将其转换为图片
video = 'video.mp4'
# video = 'pikachu.mp4'

cap = cv2.VideoCapture(video)
id = 1

while cap.isOpened():
    ret,frame = cap.read()
    if ret == False:
        break
    else:
        str_id = str(id)
        str_id_final = '{0:0>4}'.format(str_id)
        cv2.imwrite('./image/shot/test/'+'shot_'+str_id_final+'.png',frame)
        # cv2.imwrite('./image/shot/pikachu/' + 'shot_' + str_id_final + '.png', frame)
        id += 1