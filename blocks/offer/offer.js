/* RUG Original Code*/ 
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
  // URLs to your AEM Author and Publish environments
  const aempublishurl = 'https://publish-p130407-e1279066.adobeaemcloud.com';
  const aemauthorurl = 'https://author-p130407-e1279066.adobeaemcloud.com';
  // Name of your persisted GraphQL query
  const persistedquery = '/graphql/execute.json/securbank/Getrecipe2ByPath';

  // Get the path and variation from your block DOM
  const recipepath = block.querySelector(':scope div:nth-child(1) > div a').innerHTML.trim();
  const variationname = block.querySelector(':scope div:nth-child(2) > div').innerHTML.trim();

  // Choose the correct endpoint (author/publish) based on the host
  const url = window.location && window.location.origin && window.location.origin.includes('author')
    ? `${aemauthorurl}${persistedquery};path=${recipepath};variation=${variationname};ts=${Math.random() * 1000}`
    : `${aempublishurl}${persistedquery};path=${recipepath};variation=${variationname};ts=${Math.random() * 1000}`;
  const options = { credentials: 'include' };

  // Fetch the content fragment data using GraphQL
  let cfReq = {};
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    if (data?.data?.recipe2ByPath?.item) {
      cfReq = data.data.recipe2ByPath.item;
    }
  } catch (e) {
    // Error handling - output an error message in Universal Editor block
    block.innerHTML = `<div class="cf-error">Unable to load recipe content fragment.</div>`;
    return;
  }

  // Compose the unique itemId for Universal Editor
  const itemId = `urn:aemconnection:${recipepath}/jcr:content/data/master`;

  // Build and inject markup with Universal Editor attributes for inline editing
  block.innerHTML = `
  <div class='recipe-content' 
       data-aue-resource="${itemId}" 
       data-aue-label="recipe content fragment" 
       data-aue-type="reference" 
       data-aue-filter="cf">
      <div data-aue-prop="recipeImage" 
           data-aue-label="recipe image" 
           data-aue-type="media" 
           class="recipe-img"
           style="background-image: url('${cfReq.recipeImage && cfReq.recipeImage._publishUrl ? cfReq.recipeImage._publishUrl : ''}');">
      </div>
      <h2 data-aue-prop="recipeTitle" 
          data-aue-label="title" 
          data-aue-type="text" 
          class="recipe-title">${cfReq.recipeTitle ? cfReq.recipeTitle : ''}</h2>
      <p data-aue-prop="recipeDescription" 
         data-aue-label="description" 
         data-aue-type="richtext" 
         class="recipe-desc">${cfReq.recipeDescription && cfReq.recipeDescription.plaintext ? cfReq.recipeDescription.plaintext : ''}</p>
      <div data-aue-prop="recipeDirections" 
           data-aue-label="directions" 
           data-aue-type="richtext" 
           class="recipe-directions">${cfReq.recipeDirections && cfReq.recipeDirections.plaintext ? cfReq.recipeDirections.plaintext : ''}</div>
      <span data-aue-prop="_variation" 
            data-aue-label="variation" 
            data-aue-type="text" 
            class="recipe-variation">${cfReq._variation ? cfReq._variation : ''}</span>
  </div>
  `;
}
