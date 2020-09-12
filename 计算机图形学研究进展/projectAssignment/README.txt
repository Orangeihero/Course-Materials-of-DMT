
### demo
此文件夹下为项目的可执行程序Project1.exe以及依赖的动态库。若要运行本程序，则将原图、用户输入编辑图，以及包含相关参数设定的json文件置于可执行程序的同级目录下，双击运行Project1.exe，输入图片的文件路径和所用算法编号
------------------------------------------------------------------------
Input the file name of the original image: 01original.png
Input the file name of the your edit stroke image: 01user.png
Input the file name of the final image: 01_final.png
Input the method you want to use(0:AppProp, 1:Using KD Tree): 1
------------------------------------------------------------------------
运行结束后，程序将在同级目录下生成一个result文件夹，内含程序运行结果图和一些中间步骤输出图。

### src
此文件夹下为我们项目的所有源代码。

### Library
此文件夹下为我们项目所调用的所有开源库（除OpenCV外）。若要编译运行我们的源代码，可以在VS2019中配置项目的库目录与包含目录，添加开源库的对应目录。

### results
此文件夹下为我们项目的部分运行结果

### test
此文件夹下为我们的测试用例，相应的运行结果在results文件夹中可以看到。测试用例包含原图、用户输入编辑图以及包含相关参数设定的json文件，可以直接在可执行程序处运行。