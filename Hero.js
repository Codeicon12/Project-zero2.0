const superheroApiToken = '15a1662cd7f4d0c1a9f0461d8af301c1';
const marvelPublicKey = '3c4d1f635bb607521cd7efe97c57c3af';
const marvelPrivateKey = '7b10a55df407a549221982d312699ca706701bdd';

async function searchCharacter() {
  const query = document.getElementById('search-input').value.trim();
  const container = document.getElementById('results-container');
  container.innerHTML = '<p>Loading...</p>';

  if (!query) {
    container.innerHTML = '<p>Please enter a character name.</p>';
    return;
  }

  container.innerHTML = ''; // Clear previous results

  // Fetch from all APIs
  await Promise.all([
    searchSuperHeroAPI(query, container),
    searchAniListAPI(query, container),
    searchMarvelAPI(query, container)
  ]);
}

// SuperHero API (Marvel & DC)
function searchSuperHeroAPI(query, container) {
  return fetch(`https://superheroapi.com/api/${superheroApiToken}/search/${query}`)
    .then(response => response.json())
    .then(data => {
      if (data.response === 'success') {
        data.results.forEach(character => {
          displayCharacter(character.name, character.image.url, character.biography['full-name'], character.biography.publisher, container);
        });
      }
    })
    .catch(error => console.error('SuperHero API Error:', error));
}

// AniList API (Anime)
function searchAniListAPI(query, container) {
  const anilistQuery = `
    {
      Character(search: "${query}") {
        name {
          full
        }
        image {
          large
        }
        description
      }
    }
  `;

  return fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: anilistQuery })
  })
    .then(response => response.json())
    .then(data => {
      if (data.data && data.data.Character) {
        const character = data.data.Character;
        displayCharacter(character.name.full, character.image.large, character.description, 'AniList', container);
      }
    })
    .catch(error => console.error('AniList API Error:', error));
}

// Marvel API (Official)
function searchMarvelAPI(query, container) {
  const ts = new Date().getTime();
  const hash = md5(ts + marvelPrivateKey + marvelPublicKey); // Requires MD5 library

  return fetch(`https://gateway.marvel.com/v1/public/characters?name=${query}&ts=${ts}&apikey=${marvelPublicKey}&hash=${hash}`)
    .then(response => response.json())
    .then(data => {
      if (data.data && data.data.results.length > 0) {
        data.data.results.forEach(character => {
          displayCharacter(character.name, character.thumbnail.path + '.' + character.thumbnail.extension, character.description, 'Marvel', container);
        });
      }
    })
    .catch(error => console.error('Marvel API Error:', error));
}

// Display Character
function displayCharacter(name, imageUrl, description, source, container) {
  const characterCard = `
    <div class="character-card">
      <h3>${name}</h3>
      <img src="${imageUrl}" alt="${name}">
      <p>${description || 'No description available.'}</p>
      <p><strong>Source:</strong> ${source}</p>
    </div>
  `;
  container.innerHTML += characterCard;
}

