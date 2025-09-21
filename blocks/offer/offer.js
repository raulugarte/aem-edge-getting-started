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
export default async function decorate(block) {
  // --- ENV CONFIG ---
  const aempublishurl = 'https://publish-p130407-e1279066.adobeaemcloud.com';
  const aemauthorurl = 'https://author-p130407-e1279066.adobeaemcloud.com';

  // IMPORTANT: Persist a new query named "RecipeByPath" (see example below)
  const persistedquery = '/graphql/execute.json/aem-bp-comm-rug/RecipeByPath';

  // --- INPUTS FROM BLOCK MARKUP ---
  // 1st cell: anchor with the CF path; 2nd cell: variation name (optional)
  const recipePath = block.querySelector(':scope div:nth-child(1) > div a')?.textContent?.trim();
  const variationName = block.querySelector(':scope div:nth-child(2) > div')?.textContent?.trim() || 'master';

  if (!recipePath) {
    block.innerHTML = `<div class="recipe error">Missing recipe path in block configuration.</div>`;
    return;
  }

  // --- URL RESOLUTION (author vs publish) ---
  const isAuthor = typeof window !== 'undefined' && window.location?.origin?.includes('author');
  const base = isAuthor ? aemauthorurl : aempublishurl;

  const url =
    `${base}${persistedquery}` +
    `;path=${encodeURIComponent(recipePath)}` +
    `;variation=${encodeURIComponent(variationName)}` +
    `;ts=${Date.now()}`; // cache-buster

  // --- HELPERS ---
  const escapeHtml = (str) =>
    (str || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const nl2br = (str) => escapeHtml(str).replace(/\r?\n/g, '<br>');

  // --- DATA FETCH ---
  let cf;
  try {
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    cf = json?.data?.recipeByPath?.item;
  } catch (e) {
    // Keep the console log helpful for authors/devs
    // eslint-disable-next-line no-console
    console.error('Recipe fetch failed:', e);
  }

  if (!cf) {
    block.innerHTML = `<div class="recipe error">Recipe not found or fetch failed for path: ${escapeHtml(recipePath)}</div>`;
    return;
  }

  // --- UE RESOURCE TARGET (include variation) ---
  const itemId = `urn:aemconnection:${recipePath}/jcr:content/data/${variationName}`;

  // --- IMAGE ---
  const imgDynamic = cf?.recipeImage?._dynamicUrl;
  // We follow your previous pattern: always serve media from publish
  const imgUrl = imgDynamic ? `${aempublishurl}${imgDynamic}` : '';
  const imgAlt = cf?.recipeImage?.description || cf?.recipeTitle || 'Recipe image';

  // --- RENDER ---
  block.innerHTML = `
    <div class="recipe" data-aue-resource="${itemId}" data-aue-label="recipe content fragment" data-aue-type="reference" data-aue-filter="cf">
      <div class="recipe-hero" data-aue-prop="recipeImage" data-aue-label="recipe image" data-aue-type="media"
          ${imgUrl ? `style="background-image: url('${imgUrl}');"` : ''}>
        ${imgUrl ? '' : '<div class="placeholder">No image</div>'}
      </div>

      <div class="recipe-body">
        <h1 class="recipe-title" data-aue-prop="recipeTitle" data-aue-label="title" data-aue-type="text">
          ${escapeHtml(cf?.recipeTitle || '')}
        </h1>

        <div class="recipe-description" data-aue-prop="recipeDescription" data-aue-label="description" data-aue-type="richtext">
          ${nl2br(cf?.recipeDescription?.plaintext || '')}
        </div>

        <div class="recipe-sections">
          <section class="ingredients">
            <h2>Ingredients</h2>
            <div class="ingredients-rt" data-aue-prop="recipeIngredients" data-aue-label="ingredients" data-aue-type="richtext">
              ${nl2br(cf?.recipeIngredients?.plaintext || '')}
            </div>
          </section>

          <section class="directions">
            <h2>Directions</h2>
            <div class="directions-rt" data-aue-prop="recipeDirections" data-aue-label="directions" data-aue-type="richtext">
              ${nl2br(cf?.recipeDirections?.plaintext || '')}
            </div>
          </section>
        </div>
      </div>
    </div>
  `;

  // OPTIONAL: If you prefer an <img> instead of background-image, uncomment:
  // const hero = block.querySelector('.recipe-hero');
  // if (imgUrl) hero.innerHTML = `<img src="${imgUrl}" alt
