const activeToolEl = document.getElementById("active-tool");
const brushColorBtn = document.getElementById("brush-color");
const brushIcon = document.getElementById("brush");
const brushSize = document.getElementById("brush-size");
const brushSlider = document.getElementById("brush-slider");
const bucketColorBtn = document.getElementById("bucket-color");
const eraser = document.getElementById("eraser");
const clearCanvasBtn = document.getElementById("clear-canvas");
const saveStorageBtn = document.getElementById("save-storage");
const loadStorageBtn = document.getElementById("load-storage");
const clearStorageBtn = document.getElementById("clear-storage");
const downloadBtn = document.getElementById("download");
const { body } = document;

// Global Variables
const canvas = document.createElement("canvas");
canvas.id = "canvas";
const context = canvas.getContext("2d");
const msgTime = 1500;

let currentSize = 10;
let bucketColor = "#FFFFFF";
let currentColor = "#000000";
let isEraser = false;
let isMouseDown = false;
let drawnArray = [];
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 70;

//helper functions
function showMessage(msg) {
  activeToolEl.textContent = msg;

  activeToolEl.style.color = "red";
  setTimeout(() => {
    switchToBrush();

    activeToolEl.style.color = "limegreen";
  }, msgTime);
}

// Formatting Brush Size
function displayBrushSize() {
  brushSize.textContent = brushSlider.value.padStart(2, "0");
}

//cahnge events (changes in brush, bucket,brush size  )
// Setting Brush Size
brushSlider.addEventListener("change", () => {
  currentSize = brushSlider.value;
  displayBrushSize();
});

// Setting Brush Color
brushColorBtn.addEventListener("change", () => {
  isEraser = false;
  currentColor = `#${brushColorBtn.value}`;
});

// Setting Background Color
bucketColorBtn.addEventListener("change", () => {
  bucketColor = `#${bucketColorBtn.value}`;
  createCanvas();
  restoreCanvas();
});

// // Eraser event
eraser.addEventListener("click", () => {
  if (isEraser) {
    switchToBrush();
    return;
  }
  isEraser = true;
  brushIcon.style.color = "white";
  eraser.style.color = "limegreen";
  activeToolEl.textContent = "Eraser";
  currentColor = bucketColor;
  currentSize = 50;
});

// // Switch back to Brush
function switchToBrush() {
  isEraser = false;
  activeToolEl.textContent = "Brush";
  brushIcon.style.color = "limegreen";
  eraser.style.color = "white";
  currentColor = `#${brushColorBtn.value}`;
  currentSize = 10;
  brushSlider.value = 10;
  displayBrushSize();
}

// Create Canvas
function createCanvas() {
  context.fillStyle = bucketColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  document.querySelector(".canvas-container").appendChild(canvas);
  switchToBrush();
}

// Clear Canvas
clearCanvasBtn.addEventListener("click", () => {
  createCanvas();
  drawnArray = [];
  // Active Tool
  showMessage("Clear");
});

// // Draw what is stored in DrawnArray
function restoreCanvas() {
  try {
    context.fillStyle = drawnArray[drawnArray.length - 1].background;
  } catch (err) {}
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 1; i < drawnArray.length; i++) {
    context.beginPath();
    context.moveTo(drawnArray[i - 1].x, drawnArray[i - 1].y);
    context.lineWidth = drawnArray[i].size;
    context.lineCap = "round";
    if (drawnArray[i].eraser) {
      context.strokeStyle = bucketColor;
    } else {
      context.strokeStyle = drawnArray[i].color;
    }
    context.lineTo(drawnArray[i].x, drawnArray[i].y);
    context.stroke();
  }
}

// // Store Drawn Lines in DrawnArray
function storeDrawn(x, y, size, color, erase) {
  const line = {
    x,
    y,
    size,
    color,
    erase,
  };

  drawnArray.push(line);
}

// Get Mouse Position
function getMousePosition(event) {
  const boundaries = canvas.getBoundingClientRect();
  return {
    x: event.clientX - boundaries.left,
    y: event.clientY - boundaries.top,
  };
}

// Mouse Down
canvas.addEventListener("mousedown", event => {
  isMouseDown = true;
  const currentPosition = getMousePosition(event);

  context.moveTo(currentPosition.x, currentPosition.y);
  context.beginPath();
  context.lineWidth = currentSize;
  context.lineCap = "round";
  context.strokeStyle = currentColor;
});

// Mouse Move
canvas.addEventListener("mousemove", event => {
  if (isMouseDown) {
    const currentPosition = getMousePosition(event);

    context.lineTo(currentPosition.x, currentPosition.y);
    context.stroke();
    storeDrawn(
      currentPosition.x,
      currentPosition.y,
      currentSize,
      currentColor,
      isEraser
    );
  } else if (drawnArray[drawnArray.length - 1]) storeDrawn(undefined);
});

// Mouse Up
canvas.addEventListener("mouseup", () => {
  isMouseDown = false;
});

// // Save to Local Storage
saveStorageBtn.addEventListener("click", () => {
  drawnArray[drawnArray.length - 1].background = bucketColor;
  localStorage.setItem("savedCanvas", JSON.stringify(drawnArray));
  // Active Tool
  showMessage("Saved");
});

// // Load from Local Storage
loadStorageBtn.addEventListener("click", () => {
  if (localStorage.getItem("savedCanvas")) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawnArray = [];
    drawnArray = JSON.parse(localStorage.savedCanvas);
    restoreCanvas();
    // Active Tool
    showMessage("Loaded");
  } else showMessage("Empty");
});

// // Clear Local Storage
clearStorageBtn.addEventListener("click", () => {
  if (localStorage.getItem("savedCanvas")) {
    localStorage.removeItem("savedCanvas");
    // Active Tool
    showMessage("Deleted");
  } else showMessage("Empty");
});

// Download Image
downloadBtn.addEventListener("click", () => {
  downloadBtn.href = canvas.toDataURL("image/jpeg", 1);
  downloadBtn.download = "paint.jpeg";
  // Active Tool
  showMessage("⬇️");
});

// // Event Listener
brushIcon.addEventListener("click", switchToBrush);
window.addEventListener("resize", () => {
  //createCanvas();
  restoreCanvas();
});

// On Load
createCanvas();
