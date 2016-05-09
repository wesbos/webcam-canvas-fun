const video = document.querySelector('.player')
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

function getVideo() {

    navigator.mediaDevices.getUserMedia({ video: true,  audio: false })
      .then(function(localMediaStream) {
        // set the video source
        video.src = window.URL.createObjectURL(localMediaStream);
        // play the video!
        video.play();
      })
      .catch((err) => {
        console.log("The following error occured: " + err);
      });
}

function paintToCanvas() {
  /* The next four lines set the canvas to the same size as the video */
  const width = video.videoWidth;
  const height = video.videoHeight;
  canvas.width = width;
  canvas.height = height;

  // return the timer incase we ever need it
  return setInterval(function() {
    ctx.drawImage(video, 0, 0, width, height);

    // get the pixels from the canvas
    let pixels = ctx.getImageData(0,0,width,height);

    // Red Effect
    pixels = redEffect(pixels);

    // Green Screen
    pixels = greenScreen(pixels);

    // Put the pixels back!
    ctx.putImageData(pixels,0,0);

  },16);
}

function takePhoto() {
  // play snap sound
  snap.currentTime = 0;
  snap.play();

  // Then we convert that canvas to a "data blob"  which is like an image src
  const data = canvas.toDataURL('image/png');

  // 1. create an image 2. set the source the be the data 3. append to our strip
  const link = document.createElement('a');
  link.href = data;
  link.setAttribute('download', 'handsome');
  link.innerHTML = `<img src="${data}">`;

  // strip.innerHTML += img;
  strip.insertBefore(link,strip.firstChild);
}


function redEffect(pixels) {
  for (i = 0; i < pixels.data.length; i=i+4) {
    pixels.data[i + 0] = pixels.data[i + 0] + 100 ; // RED
    pixels.data[i + 1] = pixels.data[i + 1] - 50; // GREEN
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // Blue
  }
  return pixels;
}

function greenScreen(pixels) {
  const levels = {};

  [...document.querySelectorAll('.rgb input')].forEach((input)=> {
    levels[input.name] = input.value;
  });

  for (i = 0; i < pixels.data.length; i=i+4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];

    if (red >= levels.rmin
      && green >= levels.gmin
      && blue >= levels.bmin
      && red <= levels.rmax
      && green <= levels.gmax
      && blue <= levels.bmax) {
      pixels.data[i + 3] = 0;
    }
  }

  return pixels;
}

getVideo();

video.addEventListener('canplay', function() {
  paintToCanvas();
});
