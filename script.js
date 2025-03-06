// Spoonacular API Key (free tier)
const API_KEY = 'b7df605184884998a123aad487c38baf'; // You'll need to sign up at spoonacular.com/food-api
const BASE_URL = 'https://api.spoonacular.com/recipes';

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resultsContainer = document.getElementById('results-container');
const loadingSpinner = document.getElementById('loading-spinner');
const recipeModal = document.getElementById('recipe-modal');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.querySelector('.close-btn');
const filterToggle = document.querySelector('.filter-toggle');
const filterOptions = document.querySelector('.filter-options');

// Event Listeners
searchBtn.addEventListener('click', searchRecipes);
searchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchRecipes();
    }
});

filterToggle.addEventListener('click', () => {
    filterOptions.classList.toggle('active');
});

closeBtn.addEventListener('click', () => {
    recipeModal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

window.addEventListener('click', (e) => {
    if (e.target === recipeModal) {
        recipeModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Search for recipes
async function searchRecipes() {
    const query = searchInput.value.trim();

    if (!query) {
        alert('Please enter a recipe or ingredients to search');
        return;
    }

    // Get selected filters
    const vegetarian = document.getElementById('vegetarian').checked;
    const vegan = document.getElementById('vegan').checked;
    const glutenFree = document.getElementById('gluten-free').checked;
    const dairyFree = document.getElementById('dairy-free').checked;

    // Show loading spinner
    loadingSpinner.style.display = 'flex';
    resultsContainer.innerHTML = '';

    try {
        // Build query parameters
        let params = new URLSearchParams({
            apiKey: API_KEY,
            query: query,
            number: 12, // Number of results to return
            addRecipeInformation: true,
            fillIngredients: true
        });

        // Add dietary filters if selected
        if (vegetarian) params.append('diet', 'vegetarian');
        if (vegan) params.append('diet', 'vegan');
        if (glutenFree) params.append('intolerances', 'gluten');
        if (dairyFree) params.append('intolerances', 'dairy');

        const response = await fetch(`${BASE_URL}/complexSearch?${params}`);

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        displayResults(data.results);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        resultsContainer.innerHTML = `
            <div class="no-results">
                <h3>Sorry, something went wrong</h3>
                <p>Please try again later or check your API key</p>
            </div>
        `;
    } finally {
        // Hide loading spinner
        loadingSpinner.style.display = 'none';
    }
}

// Display search results
function displayResults(recipes) {
    // Clear previous results
    resultsContainer.innerHTML = '';

    if (recipes.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <h3>No recipes found</h3>
                <p>Try different ingredients or keywords</p>
            </div>
        `;
        return;
    }

    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        recipeCard.onclick = () => getRecipeDetails(recipe.id);

        // Create dietary tags
        const tags = [];
        if (recipe.vegetarian) tags.push('Vegetarian');
        if (recipe.vegan) tags.push('Vegan');
        if (recipe.glutenFree) tags.push('Gluten-Free');
        if (recipe.dairyFree) tags.push('Dairy-Free');

        // Display up to 3 tags
        const tagsHtml = tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('');

        recipeCard.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
            <div class="recipe-info">
                <h3 class="recipe-title">${recipe.title}</h3>
                <div class="recipe-details">
                    <span><i class="far fa-clock"></i> ${recipe.readyInMinutes} mins</span>
                    <span><i class="fas fa-utensils"></i> ${recipe.servings} servings</span>
                </div>
                <div class="recipe-tags">
                    ${tagsHtml}
                </div>
            </div>
        `;

        resultsContainer.appendChild(recipeCard);
    });
}

// Get detailed recipe information
async function getRecipeDetails(recipeId) {
    // Show loading spinner
    loadingSpinner.style.display = 'flex';

    try {
        const response = await fetch(`${BASE_URL}/${recipeId}/information?apiKey=${API_KEY}`);

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const recipe = await response.json();
        displayRecipeModal(recipe);
    } catch (error) {
        console.error('Error fetching recipe details:', error);
        alert('Failed to load recipe details. Please try again.');
    } finally {
        // Hide loading spinner
        loadingSpinner.style.display = 'none';
    }
}

// Display recipe details in modal
function displayRecipeModal(recipe) {
    // Format ingredients list
    const ingredientsList = recipe.extendedIngredients
        .map(ingredient => `<li>${ingredient.original}</li>`)
        .join('');

    // Format instructions
    let instructionsList = '';
    if (recipe.analyzedInstructions.length > 0 && recipe.analyzedInstructions[0].steps) {
        instructionsList = recipe.analyzedInstructions[0].steps
            .map(step => `<li>${step.step}</li>`)
            .join('');
    } else if (recipe.instructions) {
        // Some recipes have instructions as a string instead
        instructionsList = `<li>${recipe.instructions}</li>`;
    } else {
        instructionsList = '<li>No detailed instructions available for this recipe.</li>';
    }

    // Create dietary tags
    const tags = [];
    if (recipe.vegetarian) tags.push('Vegetarian');
    if (recipe.vegan) tags.push('Vegan');
    if (recipe.glutenFree) tags.push('Gluten-Free');
    if (recipe.dairyFree) tags.push('Dairy-Free');

    const tagsHtml = tags.map(tag => `<span class="tag">${tag}</span>`).join('');

    modalBody.innerHTML = `
        <div class="recipe-header">
            <img src="${recipe.image}" alt="${recipe.title}">
            <h2>${recipe.title}</h2>
            <div class="recipe-meta">
                <div class="meta-item">
                    <i class="far fa-clock"></i>
                    <span>${recipe.readyInMinutes} minutes</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-utensils"></i>
                    <span>${recipe.servings} servings</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-fire"></i>
                    <span>${Math.round(recipe.nutrition?.nutrients[0]?.amount || 0)} calories</span>
                </div>
            </div>
            <div class="recipe-tags">
                ${tagsHtml}
            </div>
        </div>
        
        <div class="recipe-content">
            <div class="ingredients-section">
                <div class="ingredients-list">
                    <h3>Ingredients</h3>
                    <ul>
                        ${ingredientsList}
                    </ul>
                </div>
            </div>
            
            <div class="instructions-section">
                <div class="instructions-list">
                    <h3>Instructions</h3>
                    <ol>
                        ${instructionsList}
                    </ol>
                </div>
            </div>
        </div>
    `;

    // Display modal
    recipeModal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
}