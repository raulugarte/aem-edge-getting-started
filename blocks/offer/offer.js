/* RUG Original Code */
/*

export default async function decorate(block) {
  const aempublishurl = 'https://publish-p130407-e1279066.adobeaemcloud.com';
  const aemauthorurl = 'https://author-p130407-e1279066.adobeaemcloud.com';
  const persistedquery = '/graphql/execute.json/securbank/OfferByPath';
  const offerpath = block.querySelector(':scope div:nth-child(1) > div a').innerHTML.trim();
  const variationname = block.querySelector(':scope div:nth-child(2) > div').innerHTML.trim();

  const url = window.location && window.location.origin && window.location.origin.includes('author')
    ? `${aemauthorurl}${persistedquery};path=${offerpath};variation=${variationname};ts=${Math.random() * 1000}`
    : `${aempublishurl}${persistedquery};path=${offerpath};variation=${variationname};ts=${Math.random() * 1000}`;
  const options = { credentials: 'include' };

  const cfReq = await fetch(url, options)
    .then((response) => response.json())
    .then((contentfragment) => {
      let offer = '';
      if (contentfragment.data) {
        offer = contentfragment.data.offerByPath.item;
      }
      return offer;
    });

  const itemId = `urn:aemconnection:${offerpath}/jcr:content/data/master`;

  block.innerHTML = `
  <div class='banner-content' data-aue-resource=${itemId} data-aue-label="offer content fragment" data-aue-type="reference" data-aue-filter="cf">
      <div data-aue-prop="heroImage" data-aue-label="hero image" data-aue-type="media" class='banner-detail' style="background-image: linear-gradient(90deg,rgba(0,0,0,0.6), rgba(0,0,0,0.1) 80%) ,url(${aempublishurl + cfReq.heroImage._dynamicUrl});">
          <p data-aue-prop="headline" data-aue-label="headline" data-aue-type="text" class='pretitle'>${cfReq.headline}</p>
          <p data-aue-prop="pretitle" data-aue-label="pretitle" data-aue-type="text" class='headline'>${cfReq.pretitle}</p>
          <p data-aue-prop="detail" data-aue-label="detail" data-aue-type="richtext" class='detail'>${cfReq.detail.plaintext}</p>
      </div>
      <div class='banner-logo'>
      </div>
  </div>
`;
}

*/


/* eslint-disable no-underscore-dangle */
// Block: recipe
// Purpose: Render a "recipe" Content Fragment via persisted GraphQL query with Universal Editor (UE) authoring hooks.
// Inputs (from block markup):
//   - 1st cell: <a> with the CF path (e.g., /content/dam/…/my-recipe)
//   - 2nd cell: variation name (e.g., master). Optional; defaults to "master".

export default async function decorate(block) {
  // --- ENV CONFIG ---
  const aempublishurl = 'https://publish-p130407-e1279066.adobeaemcloud.com';
  const aemauthorurl = 'https://author-p130407-e1279066.adobeaemcloud.com';
  const persistedquery = '/graphql/execute.json/securbank/RecipeByPath';

  // --- HELPERS ---
  const isAuthor = typeof window !== 'undefined'
    && window.location?.origin?.includes('author');

  const escapeHtml = (str) => (str || '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));

  // Turn plaintext (from CF rich text) into simple HTML line breaks
  const nl2br = (str) => escapeHtml(str || '').replace(/\r?\n/g, '<br>');

  // Safe text extraction from block config cells
  const getCellText = (selector) => block.querySelector(selector)?.textContent?.trim() || '';

  // --- INPUTS FROM BLOCK MARKUP ---
  // 1st cell anchor text: content fragment path
  const recipePath = block.querySelector(':scope div:nth-child(1) > div a')?.textContent?.trim();
  // 2nd cell: variation (optional)
  const variationName = getCellText(':scope div:nth-child(2) > div') || 'master';

  if (!recipePath) {
    block.innerHTML = `<div class="recipe error">Missing recipe path in block configuration.</div>`;
    return;
  }

  // --- URL BUILD (author vs publish) ---
  const base = isAuthor ? aemauthorurl : aempublishurl;
  const url = `${base}${persistedquery}`
    + `;path=${encodeURIComponent(recipePath)}`
    + `;variation=${encodeURIComponent(variationName)}`
    + `;ts=${Date.now()}`; // cache-buster

  // --- FETCH DATA ---
  let cf = null;
  try {
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    // Expecting: { data: { recipeByPath: { item: {...} } } }
    cf = json?.data?.recipeByPath?.item || null;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Recipe fetch failed:', e);
  }

  if (!cf) {
    block.innerHTML = `<div class="recipe error">Recipe not found or fetch failed for path: ${escapeHtml(recipePath)}</div>`;
    return;
  }

  // --- UE RESOURCE (include variation for correct authoring) ---
  const itemId = `urn:aemconnection:${recipePath}/jcr:content/data/${variationName}`;

  // --- IMAGE (use publish domain for media) ---
  const imgDynamic = cf?.recipeImage?._dynamicUrl;
  const imgUrl = imgDynamic ? `${aempublishurl}${imgDynamic}` : '';
  const imgAlt = cf?.recipeImage?.description || cf?.recipeTitle || 'Recipe image';

  // --- FIELDS ---
  const title = cf?.recipeTitle || '';
  const descriptionPlain = cf?.recipeDescription?.plaintext || '';
  const ingredientsPlain = cf?.recipeIngredients?.plaintext || '';
  const directionsPlain = cf?.recipeDirections?.plaintext || '';

  // --- RENDER ---
    block.innerHTML = `
    <div class="banner-content" data-aue-resource="${itemId}" data-aue-label="Recipe Content Fragment" data-aue-type="reference" data-aue-filter="cf">
      <div data-aue-prop="recipeImage" data-aue-label="Recipe Image" data-aue-type="media" class="banner-detail"
           style="background-image: linear-gradient(90deg,rgba(0,0,0,0.6), rgba(0,0,0,0.1) 80%) ,url(${aempublishurl + cfData.recipeImage?._dynamicUrl || ''});">

        <p data-aue-prop="recipeTitle" data-aue-label="Title" data-aue-type="text" class="headline">${cfData.recipeTitle || ''}</p>
        <p data-aue-prop="recipeDescription" data-aue-label="Description" data-aue-type="richtext" class="description">${cfData.recipeDescription?.plaintext || ''}</p>

        <h4>Ingredients:</h4>
        <p data-aue-prop="recipeIngredients" data-aue-label="Ingredients" data-aue-type="richtext" class="ingredients">${cfData.recipeIngredients?.plaintext || ''}</p>

        <h4>Directions:</h4>
        <p data-aue-prop="recipeDirections" data-aue-label="Directions" data-aue-type="richtext" class="directions">${cfData.recipeDirections?.plaintext || ''}</p>

      </div>
      <div class='banner-logo'></div>
    </div>
  `;
}
