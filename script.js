function toggleInfo(card) {
    const article = card.closest(".game");
    const info = article.querySelector('.gameFullInfo');

    //Toggle of any toggled info
    document.querySelectorAll(".gameFullInfo").forEach(otherInfo => {
        if (otherInfo !== info) {
            otherInfo.classList.add("hide");
        }
    })
    //Toggle Full Info
    info.classList.toggle("hide");
}

var sheetData = ""
var games = {}
var categories = {}
var isSystem = false;
var isGenre = false;
var systemData = []
var genreData = []

async function loadGames(pageName) {
    try {
        //Read JSON
        const response = await fetch("data/CZARCADE.json");
        const json = await response.json();
        //Load All Game's Data from Premade JSON
        sheetData = json["Inventory"];

        //Send Category Data
        if (pageName.includes("genres.html?genre")) {
            isGenre = true;
            genreData = json["Genres"];
        } else if (pageName.includes("systems.html?system")) {
            isSystem = true;
            systemData = json["Systems"];
        }
        document.dispatchEvent(new Event("categoryDataReady"));

        //Alphabetize Data
        sheetData.sort((a, b) => {
            const aValue = a["A"]?.toString().toLowerCase() || "";
            const bValue = b["A"]?.toString().toLowerCase() || "";
            return aValue.localeCompare(bValue);
        });

        //Variables to make Cards
        const gameCardTemplate = document.querySelector("[game-info-template]");
        const gameCardsContainer = document.querySelector("[game-cards-container]");
        
        sheetData.forEach(game => {
            skipGame = true
            if (game["A"] === null) {
                console.log("Null Name Found | Skipping");
                return;
            } else if (pageName.includes("genres.html?genre")) {
                //If a Genre Page, then delete all games not of that genre.
                genre = pageName.split("genre=")[1].replaceAll("%20", " ");
                if (new RegExp(`^${genre}$`).test(game["E"]) || new RegExp(`^${genre},`).test(game["E"]) ||
                    new RegExp(`, ${genre}$`).test(game["E"]) || new RegExp(`, ${genre},`).test(game["E"])) {
                    skipGame = false;
                }
                if (skipGame) {
                    console.log("Non-Genre Page Found | Skipping");
                    return;
                }
            }  else if (pageName.includes("systems.html?system")) {
                //If a System Page, then delete all games not of that system.
                system = pageName.split("system=")[1].replaceAll("%20", " ");
                if (game["H"] == system) {
                    skipGame = false;
                }
                if (skipGame) {
                    console.log("Non-System Page Found | Skipping");
                    return;
                }
            } else if (pageName == "index.html") {
                //If Main Page, load everything
                skipGame = false;
            }

            if ((game["F"] == null) || (!game["F"].toString().includes("Max Players"))) {
                const gameCard = gameCardTemplate.content.cloneNode(true).children[0];
                const gameImage = gameCard.querySelector("[game-image]")
                const loadingImage = new Image();
                gameImage.alt = `${game["A"].replaceAll('"', "'")} | ${game["H"]} Thumbnail`;
                loadingImage.src = game["C"]["imageURL"];
                loadingImage.alt = gameImage.alt;

                loadingImage.onload = () => {
                    waitingImage = document.querySelector(`img[alt="${loadingImage.alt.replaceAll('"', "'")}"]`);
                    if (loadingImage.src == null) {
                        console.log(loadingImage.alt);
                    }
                    waitingImage.src = loadingImage.src;
                    //console.log("\tLoaded.");
                    //Garbage Collection
                    loadingImage.onload = null;
                }
                
                //Set all Game Info
                gameCard.querySelector("[game-name1]").textContent = game["A"];
                gameCard.querySelector("[game-name2]").textContent = game["A"];
                gameCard.querySelector("[game-aliases1]").textContent = game["B"];
                gameCard.querySelector("[game-aliases2]").textContent = game["B"];
                gameCard.querySelector("[game-link]").innerHTML = `<a href="${game["C"]["hyperlink"]}" target="_blank">${game["C"]["text"]}</a>`;
                gameCard.querySelector("[game-language]").textContent = game["D"];
                gameCard.querySelector("[game-genres]").textContent = game["E"].split(", ").sort().join(", ");
                gameCard.querySelector("[game-players]").textContent = `Max Players: ${game["F"]}`;
                gameCard.querySelector("[game-system]").textContent = game["H"];
                //console.log(gameName);
                
                //Paint Unsupported Games
                if ((game["G"] == "ISSUE") || (game["G"] == "REMOVED") || (game["G"] == "SKIPPED") || 
                    (game["G"] == "EPILEPSEY WARNING") || (game["G"] == "INACCESSIBLE") || 
                    (game["G"] == "NOT WORKING")) {
                    gameCard.children[0].style.backgroundColor = "rgba(255, 0, 0, 0.5)"
                    gameCard.children[1].style.backgroundColor = "rgba(255, 0, 0, 0.5)"
                }

                //Add Card to HTML
                gameCardsContainer.append(gameCard);
                games[`${game["A"]} | ${game["B"]} | ${game["H"]}`] = gameCard;
            }
        });
    } catch(err) {
        console.log(err);
    }
    console.log("Data Finished");
}

async function loadCategories(pageName) {
    try {
        //Read JSON
        const response = await fetch("data/CZARCADE.json");
        const json = await response.json();
        var key = ""
        //Load All Game's Data from Premade JSON
        if (pageName == "systems.html") {
            sheetData = json["Systems"];
            key = "system"
        } else if (pageName == "genres.html") {
            sheetData = json["Genres"];
            key = "genre"
        }

        //Alphabetize Data
        sheetData.sort((a, b) => {
            const aValue = a["A"]?.toString().toLowerCase() || "";
            const bValue = b["A"]?.toString().toLowerCase() || "";
            return aValue.localeCompare(bValue);
        });

        //Variables to make Cards
        const categoryCardTemplate = document.querySelector("[category-info-template]");
        const categoryCardsContainer = document.querySelector("[game-cards-container]");
        
        sheetData.forEach(category => {
            if ((category["B"] != "Description")) {
                const categoryCard = categoryCardTemplate.content.cloneNode(true).children[0];
                const categoryImage = categoryCard.querySelector("[game-image]")
                
                //Set all Category Info
                var categoryName = ""
                if (category["A"]["text"]) {
                    categoryName = category["A"]["text"];
                    categoryCard.querySelector("[category-name1]").innerHTML = `<a href="${window.location.href}?${key}=${category["A"]["text"]}">${category["A"]["text"]}</a>`;
                    categoryCard.querySelector("[category-name2]").innerHTML = `<a href="${window.location.href}?${key}=${category["A"]["text"]}">${category["A"]["text"]}</a>`;
                } else {
                    categoryName = category["A"];
                    categoryCard.querySelector("[category-name1]").innerHTML = `<a href="${window.location.href}?${key}=${category["A"]}">${category["A"]}</a>`;
                    categoryCard.querySelector("[category-name2]").innerHTML = `<a href="${window.location.href}?${key}=${category["A"]}">${category["A"]}</a>`;
                }
                categoryImage.alt = `${categoryName} Thumbnail`;
                categoryImage.src = `media/${categoryName}.png`;
                categoryCard.querySelector("[category-description1]").textContent = category["B"];
                categoryCard.querySelector("[category-description2]").textContent = category["B"];
                categoryCard.querySelector("[category-notes]").textContent = category["C"];

                //Paint Unsupported Categories
                if ((categoryName == "Typing") || (categoryName == "UNKNOWN")) {
                    categoryCard.children[0].style.backgroundColor = "rgba(255, 0, 0, 0.5)"
                    categoryCard.children[1].style.backgroundColor = "rgba(255, 0, 0, 0.5)"
                }

                //Add Card to HTML
                categoryCardsContainer.append(categoryCard);
                categories[categoryName] = categoryCard;
            }
        });
    } catch(err) {
        console.log(err);
    }
    console.log("Data Finished");
}

//Load Relevant Data Based on what URL is running
const currentPage = window.location.href.split("/").pop();
if ((currentPage == "genres.html") || (currentPage == "systems.html")) {
    console.log("Loading Categories");
    loadCategories(currentPage);
} else {
    loadGames(currentPage);
    console.log("Loading Games");
}

//On Genre or System Pages, fix the search bar for games
if (currentPage.includes("genres.html?genre") || currentPage.includes("systems.html?system")) {
    const categorySearchBar = document.querySelector("[category-search]");
    categorySearchBar.removeAttribute("category-search");
    categorySearchBar.setAttribute("game-search", "")
    categorySearchBar.placeholder = "Search Game Name...";
}

//On Genre or System Pages, fix the Bulletin for that page
if (currentPage.includes("genres.html?genre") || currentPage.includes("systems.html?system")) {
    categoryPageName = ""
    if (currentPage.includes("genres.html?genre")) {
        isGenre = true;
        categoryPageName = currentPage.split("?genre=").pop().replaceAll("%20", " ");
    } else if (currentPage.includes("systems.html?system")) {
        isSystem = true;
        categoryPageName = currentPage.split("?system=").pop().replaceAll("%20", " ");
    }
    
    const bulletin = document.querySelector(".bulletin");
    bulletin.querySelector("h1").remove();
    bulletin.querySelectorAll("p").forEach( p => p.remove());
    bulletin.style.display = "flex";
    bulletin.style.alignItems = "center";
    bulletin.style.gap = "0.5rem";

    const titleBox = document.createElement("div");
    titleBox.classList.add("categoryTitleBox");
    bulletin.appendChild(titleBox);
    const descriptionBox = document.createElement("div");
    descriptionBox.classList.add("categoryDescriptionBox");
    bulletin.appendChild(descriptionBox);

    const thumbnailBox = document.createElement("div");
    thumbnailBox.classList.add("categoryTitleThumbnail");
    titleBox.appendChild(thumbnailBox);
    const pageThumbnail = document.createElement("img");
    pageThumbnail.src = `media/${categoryPageName}.png`;
    pageThumbnail.alt = `${categoryPageName} Page Thumbnail`;
    thumbnailBox.appendChild(pageThumbnail);

    const titleArea = document.createElement("div");
    titleArea.classList.add("categoryTitleArea");
    titleBox.appendChild(titleArea);
    const categoryTitle = document.createElement("h1");
    categoryTitle.textContent = categoryPageName;
    titleArea.appendChild(categoryTitle);

    document.addEventListener("categoryDataReady", () => {
        const description = document.createElement("div");
        description.classList.add("categoryDescription");
        if (isSystem) {
            const specificSystemData = systemData.find(system => (system["A"] == categoryPageName) 
            || (system["A"]["text"] == categoryPageName));
            console.log(specificSystemData);
            description.textContent = specificSystemData["B"];
        } else if (isGenre) {
            const specificSystemData  = genreData.find(genre => (genre["A"] == categoryPageName) 
            || (genre["A"]["text"] == categoryPageName));
            description.textContent = specificSystemData["B"];
        }
        descriptionBox.appendChild(description);
        const notes = document.createElement("div");
        notes.classList.add("categoryDescription");
        if (isSystem) {
            const specificSystemData = systemData.find(system => (system["A"] == categoryPageName) 
            || (system["A"]["text"] == categoryPageName));
            notes.textContent = specificSystemData["C"];
        } else if (isGenre) {
            const specificSystemData  = genreData.find(genre => (genre["A"] == categoryPageName) 
            || (genre["A"]["text"] == categoryPageName));
            notes.textContent = specificSystemData["C"];
        }
        descriptionBox.appendChild(notes);
    });
}

//On every Search Input, Display Relevant Games
const searchInput = document.querySelector("[game-search]");
if (searchInput != null) {
    searchInput.addEventListener("input", (e) => {
        const value = e.target.value.toLowerCase();
        Object.entries(games).forEach(([key, card]) => {
            const isVisible = key.toLowerCase().includes(value);
            card.classList.toggle("hide", !isVisible)
        })
    })
}

const searchInput2 = document.querySelector("[category-search]");
if (searchInput2 != null) {
    searchInput2.addEventListener("input", (e) => {
        const value = e.target.value.toLowerCase();
        Object.entries(categories).forEach(([key, card]) => {
            const isVisible = key.toLowerCase().includes(value);
            card.classList.toggle("hide", !isVisible)
        })
    })
}