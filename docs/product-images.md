# Generated product photography

All six catalogue photographs were generated with OpenAI's built-in image generation tool for this project. They are illustrative, unbranded food still lifes with no text or logos. Original PNG outputs were converted to 800 × 800 WebP at quality 86 for the website.

## Shared prompt

The following prompt was used for every image, replacing `{subject}` with the subject below:

> Use case: product-mockup. Asset type: square product inventory photo for a premium staff food ordering website. Primary request: {subject} Scene/backdrop: seamless warm ivory studio surface and backdrop, subtle soft shadows. Style: photorealistic editorial food photography with natural ingredient textures, appetizing and polished. Composition: centred still life, slight three-quarter view, subject fully visible with breathing room, composition suitable for square product cards. Lighting: soft natural window light from upper left, calm and warm. Constraints: no brands, no logos, no text, no labels, no watermarks, no people, no decorative lettering. Match the consistent soft cream background and restrained styling of a coordinated food product collection.

| Asset path | Subject used in the final prompt |
| --- | --- |
| `public/images/products/milk.webp` | A clear glass bottle of fresh white milk with a plain cream cap, beside a short glass of milk. |
| `public/images/products/orange-juice.webp` | A plain clear glass bottle filled with fresh orange juice with a cream cap, beside a glass of juice and half a ripe orange. |
| `public/images/products/strawberry-yogurt.webp` | Thick creamy Greek yoghurt in a simple cream ceramic bowl, fresh strawberries nestled beside it and a spoonful of yoghurt; a plain white sealed yoghurt tub in the background without any markings. |
| `public/images/products/honey.webp` | Golden honey in an unmarked clear glass jar with a simple ivory lid, a wooden honey dipper resting beside it with a small amber droplet. |
| `public/images/products/cheddar.webp` | A golden cheddar cheese wedge and a few neat cubes, on a small plain cream plate; subtle texture, inviting and realistic. |
| `public/images/products/granola.webp` | Crunchy oat and almond granola in an unmarked clear glass jar with an ivory lid, with a small ceramic bowl of granola beside it. |

These assets replace the old upload-based product images. The migration clears prior image references and `npm run db:deploy` retires the old product upload directory. Admin users select from the six bundled photos. Unknown legacy products display a neutral placeholder until an appropriate image is chosen.
