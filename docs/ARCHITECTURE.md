# NestLume architecture — foundation

## Principle
Local-first reading should keep working when identity, network or AI is unavailable. Network services add capability; they are not allowed to turn Scripture into a spinner.

## Runtime
- React 19 + TypeScript + Vite static application.
- Hand-written service worker provides shell cache in this first slice.
- No backend, Firebase SDK, Auth, Firestore or AI SDK in the browser bundle.
- Personal state in this slice is limited to interface preferences and saved-reading prototype state. IndexedDB schema and backup/export arrive in F9.

## Routes represented
- `/` Today
- `/explorar` passage/text entry
- `/ler/joao/1` reader + layered study
- `/colar` private pasted-text flow
- `/caderno` continuity prototype
- `/estados` honest error/offline/AI-unavailable states

## Editorial layering
Reader content separates Bible text from study prose. Contextual panels separately label person, original-language note, Bible thread and source provenance. The original-language panel intentionally states that the definitive lexical dataset is not yet bundled.

## Search/reference safety
Reference normalization strips diacritics for matching but preserves display. Unsupported/invalid references fail closed; they are not silently auto-corrected. The initial tested coverage distinguishes João from 1 João.

## Internationalization
PT/EN/ES interface strings exist from foundation. The Bible text remains the only licensed edition currently bundled and is not implied to change when interface locale changes.

## Hosting
`firebase.json` targets the built `dist` directory, SPA rewrites and immutable hashed assets. No `.firebaserc` project binding exists until the actual isolated Spark project/site is provisioned. This avoids accidentally deploying to another MillionsNest Firebase project.

## Planned boundaries
- `BibleEdition/PassageRef`: static packages and immutable source metadata.
- `Source/Claim/Study`: versioned editorial files.
- `Entity/Mention/LexicalEntry/Connection`: curated linked-data layer.
- `Note/Question/ReadingPosition`: browser-local/private by default.
- `GenerationRun`: server-side only if F1 is approved.

## Security rules
No secret-bearing AI provider call from the browser. No frontend role checks as authority. Hub integration, if later approved, must reuse canonical MillionsNest contracts and keep private notes outside organization scope unless explicitly designed otherwise.
