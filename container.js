// Import Firebase modules with aliasing
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  update,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.6.0/firebase-storage.js";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCoT3xOuc8IbQQwHU7XFTGnqAGXNC476bs",
  authDomain: "trekk-c65db.firebaseapp.com",
  databaseURL: "https://trekk-c65db-default-rtdb.firebaseio.com",
  projectId: "trekk-c65db",
  storageBucket: "trekk-c65db.appspot.com",
  messagingSenderId: "1060939038033",
  appId: "1:1060939038033:web:8fbd902a62e02564a5e770",
};

// Initialize Firebase
initializeApp(firebaseConfig);

const database = getDatabase();
const storage = getStorage();
let selectedDuration = [];
let printDuration = [];

// Add an event listener for the duration select element
document.getElementById("duration").addEventListener("change", function () {
  // Check if the travel date is filled
  const travelDate = document.getElementById("traveldate").value;
  if (!travelDate) {
    alert("Please fill in the travel date before choosing the duration.");
    // Reset the duration select element to the default option
    this.value = "0";
    return;
  }

  selectedDuration.push(parseInt(this.value, 10));

  // Clear existing containers
  document.getElementById("formContainer").innerHTML = "";

  // Get the initial date value from the "traveldate" input
  const initialDate = document.getElementById("traveldate").valueAsDate;

  // Create containers based on the selected duration
  for (let i = 0; i < selectedDuration; i++) {
    // For the first loop, use the initial date value; for subsequent loops, increment the date by one day
    const currentDate = new Date(initialDate);
    currentDate.setDate(initialDate.getDate() + i);

    createFormContainer(i, currentDate);
    fetchAndDisplayHeadings(i);
  }

  // Add event listener for the Save button
  document.getElementById("savedata").addEventListener("click", function () {
    // Ensure selectedDuration is defined
    if (selectedDuration === undefined) {
      console.error("Selected duration is not defined");
      return;
    }

    // Iterate over the created containers and save data to the database
    for (let i = 0; i < selectedDuration; i++) {
      saveFormData(i);
    }
  });
});

let obj;

// Modify the createFormContainer function to accept a date parameter
// Modify the createFormContainer function to accept a date parameter
function createFormContainer(index, currentDate) {
  const container = document.createElement("div");
  container.className = "w-full max-w-lg bg-white p-8 rounded shadow-lg mb-4";

  container.innerHTML = `
    
        <label for="dayNumber${index}" class="block text-gray-600 text-sm font-semibold mb-2">Day Number:</label>
        <h1 class="text-xl id="dayNumber${index}" name="dayNumber${index}"  font-semibold">Day number: </h1>

        <input type="text" id="dayNumber${index}" name="dayNumber${index}" class="w-full p-2 border border-gray-300 rounded" value="${
    index + 1
  }">

        <label for="date${index}" class="block text-gray-600 text-sm font-semibold mb-2">Date:</label>
        <input type="date" id="date${index}" name="date${index}" class="w-full p-2 border border-gray-300 rounded" value="${
    currentDate.toISOString().split("T")[0]
  }">

        <div class="relative">
            <label for="heading${index}" class="block text-gray-600 text-sm font-semibold mb-2">Heading:</label>
            <input type="text" id="heading${index}" name="heading${index}" class="w-full p-2 border border-gray-300 rounded" placeholder="Search for a heading">
            <div id="all-headings${index}" class="mt-2 absolute z-10 left-0 right-0 bg-white border border-gray-300 rounded" style="display: none;"></div>
        </div>

        <label for="descriptionDetails${index}" class="block text-gray-600 text-sm font-semibold mb-2">Description:</label>
        <textarea id="descriptionDetails${index}" name="descriptionDetails${index}" rows="4" class="w-full p-2 border border-gray-300 rounded"></textarea>

        <label for="inclusions${index}" class="block text-gray-600 text-sm font-semibold mb-2">Inclusions:</label>
        <textarea id="inclusions${index}" name="inclusions${index}" rows="4" class="w-full p-2 border border-gray-300 rounded"></textarea>

        <label for="file${index}" class="block text-gray-600 text-sm font-semibold mb-2">Choose File:</label>
        <input type="file" id="file${index}" name="file${index}" class="w-full p-2 border border-gray-300 rounded">
        <div id="image-container${index}" class="mt-2"></div>
    `;

  document.getElementById("formContainer").appendChild(container);

  // Add event listener for the heading input with search functionality
  const headingInput = document.getElementById(`heading${index}`);

  const allHeadingsContainer = document.getElementById(`all-headings${index}`);

  headingInput.addEventListener("input", function () {
    const searchTerm = this.value.trim().toLowerCase();

    // Hide or show the all-headings container based on user input
    if (searchTerm.length > 0) {
      allHeadingsContainer.style.display = "block";
    } else {
      allHeadingsContainer.style.display = "none";
    }

    // Clear the existing headings
    allHeadingsContainer.innerHTML = "";

    // Fetch and display related headings from the database
    const headingsRef = ref(database, "yourHeadingCollection"); // Change 'yourHeadingCollection' to your actual collection name
    onValue(headingsRef, (snapshot) => {
      const headingsData = snapshot.val();
      if (headingsData) {
        Object.keys(headingsData).forEach((key) => {
          const heading = headingsData[key];
          if (heading.toLowerCase().includes(searchTerm)) {
            const headingElement = document.createElement("div");
            headingElement.textContent = heading;
            headingElement.addEventListener("click", function () {
              // Autofill the selected heading in the input
              headingInput.value = heading;

              // You can add additional logic here, like autofilling other fields based on the selected heading
              const selectedData = Object.values(headingsData).find(
                (entry) => entry.heading === heading
              );
              if (selectedData) {
                // Autofill the file input if there's a file URL
                if (selectedData.fileUrl) {
                  const fileInput = document.getElementById(`file${index}`);
                  fileInput.value = selectedData.fileUrl;
                  // You may want to display the file or its details here
                }

                // Autofill the description textarea
                const descriptionTextarea = document.getElementById(
                  `descriptionDetails${index}`
                );
                descriptionTextarea.value = selectedData.description;

                // Add more fields to autofill if needed
              }
            });
            allHeadingsContainer.appendChild(headingElement);
          }
        });
      }
    });
  });

  // ... (existing code)
}

let headingElement;
let descriptionTextarea;

let headArray = [];
let descArray = [];

// let incArray;
// incArray = document.getElementById(`inclusions${index}`).value;
// Function to fetch and display headings
function fetchAndDisplayHeadings(index) {
  const allHeadingsContainer = document.getElementById(`all-headings${index}`);
  const headingInput = document.getElementById(`heading${index}`);

  // Fetch headings from the database
  const dataRef = ref(database, "yourDataCollection");
  onValue(dataRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const headings = Object.values(data).map((entry) => entry.heading);

      // Clear the existing content in the headings container
      allHeadingsContainer.innerHTML = "";

      // Event listener for input changes (search)
      headingInput.addEventListener("input", function () {
        const searchQuery = headingInput.value.toLowerCase();
        const filteredHeadings = headings.filter((heading) =>
          heading.toLowerCase().includes(searchQuery)
        );

        // Display filtered headings
        filteredHeadings.forEach((heading) => {
          headingElement = document.createElement("div");
          headingElement.textContent = heading;
          headingElement.addEventListener("click", function () {
            // Autofill the selected heading in the input
            headingInput.value = heading;
            // headArray.push(headingInput.value);

            // You can add additional logic here, like autofilling other fields based on the selected heading
            const selectedData = Object.values(data).find(
              (entry) => entry.heading === heading
            );
            if (selectedData) {
              // Fetch and display the image based on the selected heading
              fetchImage(selectedData.imageUrl, `image-container${index}`);

              // Autofill the description textarea
              descriptionTextarea = document.getElementById(
                `descriptionDetails${index}`
              );
              descriptionTextarea.value = selectedData.description;
              // descArray.push(descriptionTextarea.value);

              // printDuration.push(index + 1);

              // Add more fields to autofill if neededs
            }

            // Hide the headings container when a selection is made
            allHeadingsContainer.style.display = "none";
          });
          allHeadingsContainer.appendChild(headingElement);
        });

        // Make the headings container visible
        allHeadingsContainer.style.display = "block";
      });
    }
  });
}
let imageElement = [];
let imgArray = [];
// Function to fetch and display the image
function fetchImage(imageUrl, containerId) {
  // Fetch the image and display it in the specified container
  const imageContainer = document.getElementById(containerId);
  imageContainer.innerHTML = ""; // Clear existing content

  if (imageUrl) {
    imageElement = document.createElement("img");
    imageElement.className = "w-96";
    imageElement.src = imageUrl;
    imgArray.push(imageElement.src);
    imageElement.alt = "Image";
    imageContainer.appendChild(imageElement);
  }
}

// ... (your existing code)

// Function to fetch and display the image
function fetchImageAndUpdateInput(imageUrl, index) {
  const imageContainer = document.getElementById(`image-container${index}`);

  // Clear existing content in the image container
  imageContainer.innerHTML = "";

  // Create a new image element
  imageElement = document.createElement("img");
  imageElement.className = "w-96"; // Set the desired width
  imageElement.src = imageUrl;
  imageElement.alt = "Image";

  // Append the image element to the image container
  imageContainer.appendChild(imageElement);
}

// ... (your existing code)

// Modify the saveFormData function to use fetchImageAndUpdateInput
let dayNumber;
let heading;
let description;
let fileInput;
let dataRef;
let incl;
let Dates;

let inclutions = [];
let date = [];

function saveFormData(index) {
  try {
    dayNumber = document.getElementById(`dayNumber${index}`).value;
    heading = document.getElementById(`heading${index}`).value;
    description = document.getElementById(`descriptionDetails${index}`).value;
    fileInput = document.getElementById(`file${index}`);
    dataRef = ref(database, "yourDataCollection");
    incl = document.getElementById(`inclusions${index}`).value;
    Dates = document.getElementById(`date${index}`).value;

    printDuration.push(index + 1);
    headArray.push(heading);
    descArray.push(description);
    inclutions.push(incl);
    date.push(Dates);

    obj = [
      {
        duration: printDuration,
        head: headArray,
        desc: descArray,
        img: imgArray,
        inclutions: inclutions,
        date: date,
      },
    ];

    console.log(obj);
    // Check if the heading already exists
    const headingExists = checkHeadingExists(dataRef, heading);

    if (!headingExists) {
      const newEntryRef = push(dataRef, {
        dayNumber: dayNumber,
        heading: heading,
        description: description,
      });

      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const storagePath = `yourStoragePath/${newEntryRef.key}/${file.name}`;

        uploadBytes(storageRef(storage, storagePath), file)
          .then(() => getDownloadURL(storageRef(storage, storagePath)))
          .then((downloadURL) => {
            // Update the file input and display the image
            fetchImageAndUpdateInput(downloadURL, index);
            // Save the image URL to the database
            update(newEntryRef, { imageUrl: downloadURL });
            imgArray = [downloadURL];
            console.log(`${downloadURL}${[index]}`);
          })
          .catch((error) => console.error("Error during file upload:", error));
      }

      // Update other fields in the database (e.g., inclusions)
      update(newEntryRef, { inclusions: inclusions });
    } else {
      console.log("Heading already exists. Not saving duplicate.");
    }
  } catch (error) {
    console.error("Error during saveFormData:", error);
  }
}

// Function to check if the heading already exists
function checkHeadingExists(dataRef, newHeading) {
  let headingExists = false;
  onValue(dataRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const headings = Object.values(data).map((entry) => entry.heading);
      headingExists = headings.includes(newHeading);
    }
  });
  return headingExists;
}

document.getElementById("printButton").addEventListener("click", function () {
  // Call the print function
  printForm();
});

function printForm() {
  // Get the container with form data
  const formContainer = document.getElementById("formContainer");

  // Create a new window for printing
  const printWindow = window.open("", "_blank");

  // Write the printable HTML content to the new window
  printWindow.document.write(`
  <html>
  <head>
      <title>Print Form</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
  </head>
  <body>
      <div>
      ${
        obj &&
        obj
          .map((items, index) => {
            return `
              <div class="flex flex-col gap-4" key=${index}>
              ${items.duration
                .map((data, index) => {
                  return `
                    <div>
                      <p>Heading: ${items.head[index]}</p>
                      <p>Duration: ${items.duration[index]}</p>
                      <p>description: ${items.desc[index]}</p>
                      <p>inclutions: ${items.inclutions[index]}</p>
                      <p>date: ${items.date[index]}</p>
                      <img src=${items.img[index]}/>
                    </div>
                  `;
                })
                .join("")}
              </div>
            `;
          })
          .join("")
      }
      </div>
  </body>
</html>
    `);

  printWindow.document.close();

  printWindow.print();
}

function getPrintableContent(container) {
  // Create a clone of the container to avoid modifying the original
  const printableContainer = container.cloneNode(true);

  // Replace input fields with their values and apply Tailwind CSS classes
  const inputElements = printableContainer.querySelectorAll("input, textarea");
  inputElements.forEach((input) => {
    const value = input.value;
    const textNode = document.createTextNode(value);
    input.parentNode.replaceChild(textNode, input);
    input.classList.add(
      "w-full",
      "p-2",
      "border",
      "border-gray-300",
      "rounded"
    );

    // Add classes specifically for the Daynumber input field
    if (input.id.startsWith("dayNumber")) {
      input.classList.add("font-semibold", "text-lg", "bg-gray-100");
    }
  });

  // Remove labels and unnecessary elements
  const labelsToRemove = ["Description:", "Inclusions:", "Choose File:"];
  labelsToRemove.forEach((label) => {
    const labelElements = printableContainer.querySelectorAll("*");
    labelElements.forEach((labelElement) => {
      if (labelElement.textContent.trim() === label) {
        labelElement.parentNode.removeChild(labelElement);
      }
    });
  });

  // Style images with Tailwind CSS classes
  const imageElements = printableContainer.querySelectorAll("img");
  imageElements.forEach((image) => {
    image.classList.add("w-full", "h-full", "object-cover", "rounded-2xl");
  });

  return printableContainer.innerHTML;
}
