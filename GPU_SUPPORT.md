# GPU Support

MegaDetector comes with GPU support which enables much faster image processing.

The following instructions are **somewhat technical** and have not been tested extensively (meaning there is a chance that you might run into some issues)

## 1. Check if have a compatible CUDA GPU.

If you don't, then you cannot proceed. You can find the [list of compatible GPUs here](https://developer.nvidia.com/cuda-gpus). It may or may not be up to date, so do some research if you believe you have a compatible GPU that isn't listed.

## 2. Update your GPU drivers to the latest version

You can find the latest drivers for your model [here](https://www.nvidia.com/download/index.aspx?lang=en-us)

## 3. Install CUDA Toolkit **10.1**

<span style="color:red">**It's important to ensure you download the exact versions specified. The app was built with them in mind and I cannot guarantee it will work with other versions.**</span>

### 3.1 Download the [Toolkit](https://developer.nvidia.com/cuda-10.1-download-archive-update2)

<div align="center">
    <img src="https://i.imgur.com/XMU7NBB.png" width="500" >
</div>
<br/>
<br/>

### 3.2 Download [cuDNN **v7.6.5**](https://developer.nvidia.com/compute/machine-learning/cudnn/secure/7.6.5.32/Production/10.1_20191031/cudnn-10.1-windows10-x64-v7.6.5.32.zip) for Windows 10 _(you will need to create an NVIDIA account)_

- Extract the contents of the zip file into a temporary folder
- Copy `<tempfolder>/cuda/bin/cudnn64_7.dll` to `C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v10.1\bin\`
- Copy `<tempfolder>/cuda/include/cudnn.h` to `C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v10.1\include\`
- Copy `<tempfolder>/cuda/lib/x64/cudnn.lib` to `C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v10.1\lib\x64\`

## 4. Add the CUDA environment variables to your PATH

You might find that they are already there in which case it's fine. Here are some screenshots to guide you:

<div align="center">
    <img src="https://i.imgur.com/cgpptz2.png" width="400" >
</div>

<div align="center">
    <img src="https://i.imgur.com/tC8PUY4.png" width="400" >
</div>

<div align="center">
    <img src="https://i.imgur.com/Mv4eFzu.png" width="400" >
</div>
