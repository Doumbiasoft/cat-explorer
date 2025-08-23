import * as Carousel from "./Carousel.mjs";

//simulate current user
const sub_id = "main_user";
let selectedBreedValue = "";
let listType = "BreadList"; //BreadList or FavoriteList. by default it BreadList
// Base url
const baseURL = " https://api.thecatapi.com/v1";
// The breed selection input element.
const $breedSelect = document.getElementById("breedSelect");
// The information section div element.
const $infoDump = document.getElementById("infoDump");
// The progress bar div element.
const $progressBar = document.getElementById("progressBar");
// The get favorites button element.
const $getFavoritesBtn = document.getElementById("getFavoritesBtn");
// The breed info template
const $infoDumpItemTemplate = document.querySelector("#infoDumpItemTemplate");
// The favorite title
const $favTitle = document.querySelector(".favTitle");
// Step 0: Store your API key here for reference and easy access.
const API_KEY =
  "live_7abJmYpYBVV0FaLAA2kCXZJ5dKSUZh51d4vS9xMmQV9zdDMxFzEU1NlQtVlzwTdj";
const headers = {
  "x-api-key": API_KEY,
};
// define an instance of axios and add default setting
const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: headers,
});
axiosInstance.interceptors.request.use(
  (req) => {
    $progressBar.style.width = "0%";
    document.body.style.cursor = "progress";
    req.metadata = req.metadata || {};
    req.metadata.startTime = new Date().getTime();
    const startTime = new Date().toLocaleString();
    console.log(
      `⏳ Request is starting at ${startTime}. (based on local time)`
    );
    return {
      ...req,
      onDownloadProgress: updateProgress,
    };
  },
  (error) => {
    $progressBar.style.width = "0%";
    document.body.style.cursor = "";
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (res) => {
    res.config.metadata.endTime = new Date().getTime();
    res.config.metadata.durationInMS =
      res.config.metadata.endTime - res.config.metadata.startTime;

    console.log(
      `⏳ Request took ${res.config.metadata.durationInMS} milliseconds.`
    );
    $progressBar.style.width = "100%";
    document.body.style.cursor = "";
    return res;
  },
  (error) => {
    error.config.metadata.endTime = new Date().getTime();
    error.config.metadata.durationInMS =
      error.config.metadata.endTime - error.config.metadata.startTime;

    console.log(
      `⏳ Request took ${error.config.metadata.durationInMS} milliseconds.`
    );
    $progressBar.style.width = "100%";
    document.body.style.cursor = "";
    throw error;
  }
);

const initialLoad = async () => {
  //let data = await getBreedsUsingFetch();
  let data = await getBreedsUsingAxios();
  loadBreedOptions(data);
};
// Populate select options with breeds
const loadBreedOptions = (data) => {
  try {
    const option = document.createElement("option");
    option.value = "";
    option.innerHTML = `-- --`;
    $breedSelect.appendChild(option);
    data = data.filter((img) => img.image?.url !== null);
    for (let i = 0; i < data.length; i++) {
      const breed = data[i];
      const option = document.createElement("option");
      //skip any breeds that do not have an image
      if (!breed.image) continue;
      option.value = breed.id;
      option.innerHTML = `${breed.name}`;
      $breedSelect.appendChild(option);
    }
    Carousel.clear();
    Carousel.start();
  } catch (error) {
    console.error("❌ Error - loadBreedOptions : ", error.message);
  }
};
// get breeds using Fetch
const getBreedsUsingFetch = async () => {
  try {
    const response = await fetch(`${baseURL}/breeds`, {
      headers,
    });
    let data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error - getBreedsUsingFetch : ", error.message);
  }
};
// get selected breed selected using Fetch
const getSelectedBreedUsingFetch = async (selectedValue) => {
  try {
    const response = await fetch(
      `${baseURL}/images/search?breed_id=${selectedValue}&limit=20`,
      {
        headers,
      }
    );
    let data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error - getSelectedBreedUsingFetch : ", error.message);
  }
};
// get breeds using Axios
const getBreedsUsingAxios = async () => {
  try {
    const response = await axiosInstance.get("/breeds");
    let data = response.data;

    return data;
  } catch (error) {
    console.error("❌ Error - getBreedsUsingAxios : ", error.message);
  }
};
// get selected breed selected using Axios
const getSelectedBreedUsingAxios = async (selectedValue) => {
  try {
    const response = await axiosInstance.get(
      `/images/search?breed_id=${selectedValue}&limit=20`
    );
    let data = response.data;
    console.log(`💽`, data);
    listType = "BreadList";
    return data;
  } catch (error) {
    console.error("❌ Error - getSelectedBreedUsingFetch : ", error.message);
  }
};
// Handler for breed select options
const handleBreedSelected = async (e) => {
  try {
    Carousel.clear();
    $infoDump.innerHTML = "";
    selectedBreedValue = e.target.value;
    if (selectedBreedValue === "") return;
    //let data = await getSelectedBreedUsingFetch(selectedBreedValue);
    let data = await getSelectedBreedUsingAxios(selectedBreedValue);
    let breed = data[0].breeds[0];
    createInfoDisplayElements(breed);
    loadCarousel(data);
    $favTitle.style.display = "none";
  } catch (error) {
    console.error("❌ Error - handleBreedSelected : ", error.message);
  }
};
// Function to load the carousel with the data fetch
const loadCarousel = (data) => {
  try {
    for (let i = 0; i < data.length; i++) {
      const imageURL = data[i].url;
      const imageId = data[i].id;
      const imageAltName =
        data[i].breeds[0].alt_names !== ""
          ? data[i].breeds[0].alt_names
          : data[i].breeds[0].name;
      const carouselItem = Carousel.createCarouselItem(
        imageURL,
        imageAltName,
        imageId
      );
      Carousel.appendCarousel(carouselItem);
    }
    Carousel.start();
  } catch (error) {
    console.error("❌ Error - loadCarousel : ", error.message);
  }
};
// Function to generate stars based on the star number
const createStars = (number) => {
  try {
    let result = "";
    let noStar = "";
    for (let i = 1; i <= number; i++) {
      result += "⭐️";
    }
    if (number < 5) {
      noStar = "";
      let noStarNumber = 5 - number;
      for (let i = 1; i <= noStarNumber; i++) {
        noStar += "☆";
      }
    }
    return result + noStar;
  } catch (error) {
    console.error("❌ Error - createStars : ", error.message);
  }
};

// Function to create and display a breed info
const createInfoDisplayElements = (breed) => {
  const $clone =
    $infoDumpItemTemplate.content.firstElementChild.cloneNode(true);
  const $name = $clone.querySelector(".name");
  const $origin = $clone.querySelector(".origin");
  const $description = $clone.querySelector(".description");
  const $temperament = $clone.querySelector(".temperament");
  const $lifeSpan = $clone.querySelector(".life-span");
  const $weight = $clone.querySelector(".weight");
  const $adaptability = $clone.querySelector(".adaptability");
  const $affection = $clone.querySelector(".affection");
  const $childFriendly = $clone.querySelector(".child-friendly");
  const $dogFriendly = $clone.querySelector(".dog-friendly");
  const $intelligence = $clone.querySelector(".intelligence");
  const $energieLevel = $clone.querySelector(".energie-level");
  const $grooming = $clone.querySelector(".grooming");
  const $wiki = $clone.querySelector("#wiki");
  const $vets = $clone.querySelector("#vets");

  $name.innerHTML = breed.name;
  $origin.innerHTML = breed.origin;
  $description.innerHTML = breed.description;
  $temperament.innerHTML = breed.temperament;
  $lifeSpan.innerHTML = breed.life_span;
  $weight.innerHTML = breed.weight.imperial;
  $adaptability.innerHTML = createStars(Number(breed.adaptability));
  $affection.innerHTML = createStars(Number(breed.affection_level));
  $childFriendly.innerHTML = createStars(Number(breed.child_friendly));
  $dogFriendly.innerHTML = createStars(Number(breed.dog_friendly));
  $intelligence.innerHTML = createStars(Number(breed.intelligence));
  $energieLevel.innerHTML = createStars(Number(breed.energy_level));
  $grooming.innerHTML = createStars(Number(breed.grooming));
  $wiki.href = breed.wikipedia_url;
  if (breed.vetstreet_url) {
    $vets.href = breed.vetstreet_url;
  } else {
    $vets.style.display = "none";
  }
  $infoDump.appendChild($clone);
};
// Define the progress handler function
const updateProgress = (progressEvent) => {
  if (progressEvent.lengthComputable) {
    const percentCompleted = Math.round(
      (progressEvent.loaded * 100) / progressEvent.total
    );
    $progressBar.style.width = `${percentCompleted}%`;
    console.log(`📊 Download progress: ${percentCompleted}%`);
  } else {
    $progressBar.style.width = `100%`;
    console.log(
      `📦 Download progress: ${progressEvent.loaded} bytes loaded (total unknown)`
    );
  }
};
export const favorite = async (imgId) => {
  try {
    console.log(`🔥 click favorite ${imgId}`);
    const favoriteData = {
      image_id: imgId,
      sub_id: sub_id,
    };
    const response = await axiosInstance.post("/favourites", favoriteData);
    if (response.status === 200 || response.status === 201) {
      console.log(`🎯 Favorite successfully added ${imgId}`);
      console.log("Response:", response.data);
      if (listType === "BreadList") {
        Carousel.clear();
        $infoDump.innerHTML = "";
        let data = await getSelectedBreedUsingAxios(selectedBreedValue);
        let breed = data[0].breeds[0];
        createInfoDisplayElements(breed);
        loadCarousel(data);
        $favTitle.style.display = "none";
      } else {
        await handleGetFavorites();
      }
      return response.data;
    } else {
      console.error("😱 Unexpected response status:", response.status);
    }
  } catch (error) {
    console.error(`❌ Error - adding favorite ${imgId}:`, error.message);
  }
};
// Remove from favorites
export const removeFavorite = async (favoriteId) => {
  try {
    const response = await axiosInstance.delete(`/favourites/${favoriteId}`);
    if (response.status === 200) {
      console.log(`🗑️ Favorite removed: ${favoriteId}`);

      if (listType === "BreadList") {
        Carousel.clear();
        $infoDump.innerHTML = "";
        let data = await getSelectedBreedUsingAxios(selectedBreedValue);
        let breed = data[0].breeds[0];
        createInfoDisplayElements(breed);
        loadCarousel(data);
        $favTitle.style.display = "none";
      } else {
        await handleGetFavorites();
      }

      return response.data;
    }
  } catch (error) {
    console.error(`❌ Error - removing favorite ${favoriteId}:`, error);
    throw error;
  }
};

// Check if an image is in favorites
export const isFavorite = async (imageId) => {
  try {
    const response = await axiosInstance.get(`/favourites?sub_id=${sub_id}`);
    if (response.status === 200) {
      const favorites = response.data;
      const favoriteItem = favorites.find((fav) => fav.image_id === imageId);
      return {
        isFavorite: !!favoriteItem,
        favoriteId: favoriteItem ? favoriteItem.id : null,
      };
    }
    return { isFavorite: false, favoriteId: null };
  } catch (error) {
    console.error(`❌ Error checking if ${imageId} is favorite:`, error);
    return { isFavorite: false, favoriteId: null };
  }
};

// handler to get all favorites
const handleGetFavorites = async () => {
  let data = await getFavorites();
  Carousel.clear();
  listType = "FavoriteList";
  $infoDump.innerHTML = "";
  for (let i = 0; i < data.length; i++) {
    let breed = data[i].breeds[0];
    console.log(`🐈 Favorites breed ${i}:`, breed);
    createInfoDisplayElements(breed);
  }
  $favTitle.style.display = "block";
  loadCarousel(data);
};
const getFavorites = async () => {
  try {
    const favoritesResponse = await axiosInstance.get(
      `/favourites?sub_id=${sub_id}`
    );
    if (favoritesResponse.status === 200) {
      const basicFavorites = favoritesResponse.data;
      // Extract just the image iDs
      const imageIds = basicFavorites.map((fav) => fav.image_id);
      // Fetch complete image data for all favorite images
      const imagePromises = imageIds.map(async (imageId) => {
        try {
          const response = await axiosInstance.get(`/images/${imageId}`);
          return response.data;
        } catch (error) {
          console.warn(`⚠️ Could not fetch image ${imageId}:`, error.message);
          return null;
        }
      });
      const imagesWithBreeds = await Promise.all(imagePromises);
      // Filter out null results and format
      const formattedFavorites = imagesWithBreeds
        .filter(Boolean)
        .map((image) => ({
          breeds: image.breeds || [],
          id: image.id,
          url: image.url,
          width: image.width,
          height: image.height,
        }));

      console.log("🎯 Favorites formatted:", formattedFavorites);
      return formattedFavorites;
    }
  } catch (error) {
    console.error("❌ Error getting formatted favorites:", error);
    throw error;
  }
};

(function () {
  initialLoad();
})();
// Select breed option eventListener
$breedSelect.addEventListener("change", handleBreedSelected);
// Get Favorites list button eventListener
$getFavoritesBtn.addEventListener("click", handleGetFavorites);

/**
 * 1. Create an async function "initialLoad" that does the following:
 * - Retrieve a list of breeds from the cat API using fetch().
 * - Create new <options> for each of these breeds, and append them to breedSelect.
 *  - Each option should have a value attribute equal to the id of the breed.
 *  - Each option should display text equal to the name of the breed.
 * This function should execute immediately.
 */

/**
 * 2. Create an event handler for breedSelect that does the following:
 * - Retrieve information on the selected breed from the cat API using fetch().
 *  - Make sure your request is receiving multiple array items!
 *  - Check the API documentation if you're only getting a single object.
 * - For each object in the response array, create a new element for the carousel.
 *  - Append each of these new elements to the carousel.
 * - Use the other data you have been given to create an informational section within the infoDump element.
 *  - Be creative with how you create DOM elements and HTML.
 *  - Feel free to edit index.html and styles.css to suit your needs, but be careful!
 *  - Remember that functionality comes first, but user experience and design are important.
 * - Each new selection should clear, re-populate, and restart the Carousel.
 * - Add a call to this function to the end of your initialLoad function above to create the initial carousel.
 */

/**
 * 3. Fork your own sandbox, creating a new one named "JavaScript Axios Lab."
 */
/**
 * 4. Change all of your fetch() functions to axios!
 * - axios has already been imported for you within index.js.
 * - If you've done everything correctly up to this point, this should be simple.
 * - If it is not simple, take a moment to re-evaluate your original code.
 * - Hint: Axios has the ability to set default headers. Use this to your advantage
 *   by setting a default header with your API key so that you do not have to
 *   send it manually with all of your requests! You can also set a default base URL!
 */
/**
 * 5. Add axios interceptors to log the time between request and response to the console.
 * - Hint: you already have access to code that does this!
 * - Add a console.log statement to indicate when requests begin.
 * - As an added challenge, try to do this on your own without referencing the lesson material.
 */

/**
 * 6. Next, we'll create a progress bar to indicate the request is in progress.
 * - The progressBar element has already been created for you.
 *  - You need only to modify its "width" style property to align with the request progress.
 * - In your request interceptor, set the width of the progressBar element to 0%.
 *  - This is to reset the progress with each request.
 * - Research the axios onDownloadProgress config option.
 * - Create a function "updateProgress" that receives a ProgressEvent object.
 *  - Pass this function to the axios onDownloadProgress config option in your event handler.
 * - console.log your ProgressEvent object within updateProgress, and familiarize yourself with its structure.
 *  - Update the progress of the request using the properties you are given.
 * - Note that we are not downloading a lot of data, so onDownloadProgress will likely only fire
 *   once or twice per request to this API. This is still a concept worth familiarizing yourself
 *   with for future projects.
 */

/**
 * 7. As a final element of progress indication, add the following to your axios interceptors:
 * - In your request interceptor, set the body element's cursor style to "progress."
 * - In your response interceptor, remove the progress cursor style from the body element.
 */
/**
 * 8. To practice posting data, we'll create a system to "favorite" certain images.
 * - The skeleton of this function has already been created for you.
 * - This function is used within Carousel.js to add the event listener as items are created.
 *  - This is why we use the export keyword for this function.
 * - Post to the cat API's favorites endpoint with the given ID.
 * - The API documentation gives examples of this functionality using fetch(); use Axios!
 * - Add additional logic to this function such that if the image is already favored,
 *   you delete that favorite using the API, giving this function "toggle" functionality.
 * - You can call this function by clicking on the heart at the top right of any image.
 */

/**
 * 9. Test your favorite() function by creating a getFavorites() function.
 * - Use Axios to get all of your favorites from the cat API.
 * - Clear the carousel and display your favorites when the button is clicked.
 *  - You will have to bind this event listener to getFavoritesBtn yourself.
 *  - Hint: you already have all of the logic built for building a carousel.
 *    If that isn't in its own function, maybe it should be so you don't have to
 *    repeat yourself in this section.
 */

/**
 * 10. Test your site, thoroughly!
 * - What happens when you try to load the Malayan breed?
 *  - If this is working, good job! If not, look for the reason why and fix it!
 * - Test other breeds as well. Not every breed has the same data available, so
 *   your code should account for this.
 */
