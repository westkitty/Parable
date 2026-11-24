# Parable M1 — Asset Ledger

Every third-party file shipped in `game/public/assets/`. All are **CC0 1.0** (public domain dedication) by Kenney (www.kenney.nl); each pack's original `License.txt` is kept beside its files. Downloaded 2026-11-23 via Kenney's free download flow (no donation). Only files actually used are included.

Original (non-third-party) art, all procedural code in this repo, labelled honestly:

- **Divine hand** — `src/hand/hand.ts`: original procedural stylised hand (capsule palm/fingers, warm skin, glow). No verified CC0 hand model was found, and Blender is not installed on the build box, so this is code-built art, not a model file.
- **Fireball** — `src/render/actors.ts`: procedural emissive core/shell + particle flames.
- **Fire, smoke, golden gesture trace** — `src/render/particles.ts` (soft point sprites).
- **Terrain, water, sky** — procedural (`src/render/terrain.ts`, `environment.ts`; sky is three.js `Sky` addon, MIT).
- **Temple tablets glyphs, chamber stone texture** — canvas-drawn in `src/temple/temple.ts`.

Total third-party asset size: 0.90 MB (budget 40 MB).

| File | Pack | Source | License | Bytes | SHA-256 | Used in M1 |
|---|---|---|---|---|---|---|
| `assets/kenney-fantasy-town-kit/License.txt` | Fantasy Town Kit | https://kenney.nl/assets/fantasy-town-kit | CC0 1.0 | 705 | `fb8e4817197ef9f62215e95b4451a0f09c769c8e03e416e3a2ce108dfa6117e4` | yes |
| `assets/kenney-fantasy-town-kit/banner-red.glb` | Fantasy Town Kit | https://kenney.nl/assets/fantasy-town-kit | CC0 1.0 | 9988 | `4e4a83de16e5979d2b34bb206d3bf3703a9039711bc658b37e3738d43090703d` | yes |
| `assets/kenney-fantasy-town-kit/chimney.glb` | Fantasy Town Kit | https://kenney.nl/assets/fantasy-town-kit | CC0 1.0 | 4656 | `a15cdbd13860092f6d793e5b785043eb90a49cdaa725bb71df9fd154ca68dac6` | yes |
| `assets/kenney-fantasy-town-kit/fence.glb` | Fantasy Town Kit | https://kenney.nl/assets/fantasy-town-kit | CC0 1.0 | 7672 | `92261b9419108d84f3db0def5eadeffa783032029897562b1f512e4a7570ef48` | no — kept from the first import, candidate for M2 |
| `assets/kenney-fantasy-town-kit/lantern.glb` | Fantasy Town Kit | https://kenney.nl/assets/fantasy-town-kit | CC0 1.0 | 14984 | `f270637e3083d6e84a30626ee05df2b09597a642985a7f5c3e4ab5bb1c7a8d55` | yes |
| `assets/kenney-fantasy-town-kit/pillar-stone.glb` | Fantasy Town Kit | https://kenney.nl/assets/fantasy-town-kit | CC0 1.0 | 11324 | `1eda742ccbc67ead6edead25c687f55d8671b88786b9e23c08ae7982bccb4b7c` | yes |
| `assets/kenney-fantasy-town-kit/roof-gable-end.glb` | Fantasy Town Kit | https://kenney.nl/assets/fantasy-town-kit | CC0 1.0 | 6056 | `2ee635e8550180bb7840f7fdfff0b0835a34a425ffb903f19657cde65c261704` | yes |
| `assets/kenney-fantasy-town-kit/roof-gable.glb` | Fantasy Town Kit | https://kenney.nl/assets/fantasy-town-kit | CC0 1.0 | 7632 | `4bb6bdbcadbb8ebeb69d720e29f6c2e57c99d98966baa41fd86914d3c13d6039` | yes |
| `assets/kenney-fantasy-town-kit/roof-high-point.glb` | Fantasy Town Kit | https://kenney.nl/assets/fantasy-town-kit | CC0 1.0 | 6192 | `dd26c8d572f05a4725317de01415a17819b2d12cf01c8907bb2116b4ad8e85e9` | yes |
| `assets/kenney-fantasy-town-kit/stairs-stone.glb` | Fantasy Town Kit | https://kenney.nl/assets/fantasy-town-kit | CC0 1.0 | 12172 | `ce92a069280c069d675f030a7258a50f5271cd8070e84339c120faa6c115e61d` | no — kept from the first import, candidate for M2 |
| `assets/kenney-fantasy-town-kit/wall-block.glb` | Fantasy Town Kit | https://kenney.nl/assets/fantasy-town-kit | CC0 1.0 | 8532 | `daa35e5b32d7941f3dc61f64f6f9630b70441478d652989cd6c02a908b84af86` | yes |
| `assets/kenney-fantasy-town-kit/wall-corner.glb` | Fantasy Town Kit | https://kenney.nl/assets/fantasy-town-kit | CC0 1.0 | 6788 | `d67d4c6210d5e877ce24ccfb42cb3eab1576f7addb689924e7776d6b73e4165a` | no — kept from the first import, candidate for M2 |
| `assets/kenney-fantasy-town-kit/wall-doorway-round.glb` | Fantasy Town Kit | https://kenney.nl/assets/fantasy-town-kit | CC0 1.0 | 13332 | `773ccde0f2b39d7fa61e5093fc4f11b137732a5becbe278c9dae03917895fe98` | yes |
| `assets/kenney-fantasy-town-kit/wall-wood-corner.glb` | Fantasy Town Kit | https://kenney.nl/assets/fantasy-town-kit | CC0 1.0 | 6804 | `f4c38de352c80c110874fabe7323577d985af191c25242887574238146dc7d82` | no — kept from the first import, candidate for M2 |
| `assets/kenney-fantasy-town-kit/wall-wood-door.glb` | Fantasy Town Kit | https://kenney.nl/assets/fantasy-town-kit | CC0 1.0 | 30744 | `2aa4e982fcb6434be4e6051fcee7972799ff5350a3f36ca8bf71530b84608123` | yes |
| `assets/kenney-fantasy-town-kit/wall-wood-window-shutters.glb` | Fantasy Town Kit | https://kenney.nl/assets/fantasy-town-kit | CC0 1.0 | 10612 | `c45a63690760cd5de3842ffbe222092e8cd483524679c4ba92fef4d1e52f7248` | yes |
| `assets/kenney-fantasy-town-kit/wall-wood.glb` | Fantasy Town Kit | https://kenney.nl/assets/fantasy-town-kit | CC0 1.0 | 4808 | `8699614fdbc99f565942709c0977c964e2c12f3b3c60098a6e2c397c973f08db` | yes |
| `assets/kenney-fantasy-town-kit/wall.glb` | Fantasy Town Kit | https://kenney.nl/assets/fantasy-town-kit | CC0 1.0 | 4792 | `cab1dff37610e2a214237cc62ec0b1506e8fd76bb66c29f6c585b4b643b569c4` | yes |
| `assets/kenney-fantasy-town-kit/Textures/colormap.png` | Fantasy Town Kit | https://kenney.nl/assets/fantasy-town-kit | CC0 1.0 | 11143 | `4aac939dc33195e35caf8c382ee3cb170054da763577f22d3c22692ec6afccdf` | yes |
| `assets/kenney-mini-characters/License.txt` | Mini Characters | https://kenney.nl/assets/mini-characters | CC0 1.0 | 704 | `92aba6c40f4d09ea7c637c50b36147946632e5ade3c0296ca78be1effcd81661` | yes |
| `assets/kenney-mini-characters/character-female-b.glb` | Mini Characters | https://kenney.nl/assets/mini-characters | CC0 1.0 | 249988 | `3a0e6c3e431ae9d2016c2c9a91ec3abe8bb45243016a5cae80cbde0b61f8f2a9` | yes |
| `assets/kenney-mini-characters/character-male-c.glb` | Mini Characters | https://kenney.nl/assets/mini-characters | CC0 1.0 | 259876 | `6bb3b1ac8b196fd005dd5cb73621cd88d8a44d1f0f92fcf0c03f3b47ac9b9a74` | no — kept from the first import, candidate for M2 |
| `assets/kenney-mini-characters/Textures/colormap.png` | Mini Characters | https://kenney.nl/assets/mini-characters | CC0 1.0 | 10852 | `3aba07b39c13e9fa9a02cba6246fdd9d711bb15702e00e10ad84595b25452f95` | yes |
| `assets/kenney-nature-kit/License.txt` | Nature Kit 2.1 | https://kenney.nl/assets/nature-kit | CC0 1.0 | 611 | `cb96b75e3560ac78d7a53ce6f083f4cdb5c53faea6141b62d63458dcfe1e4b9d` | yes |
| `assets/kenney-nature-kit/campfire_logs.glb` | Nature Kit 2.1 | https://kenney.nl/assets/nature-kit | CC0 1.0 | 9284 | `98d87cdcf9095b94fd348d0946e911dd4ca6c0956bac3318cfd2b0030b86055a` | yes |
| `assets/kenney-nature-kit/crops_wheatStageB.glb` | Nature Kit 2.1 | https://kenney.nl/assets/nature-kit | CC0 1.0 | 30040 | `589db4d6fe0bd7616c1f1c2f10a335704b2dad5d24638dc08a5b2e5334c68852` | yes |
| `assets/kenney-nature-kit/fence_simple.glb` | Nature Kit 2.1 | https://kenney.nl/assets/nature-kit | CC0 1.0 | 5712 | `ecaf6c29532aa9fd305a8ef71df769d60748bd797f2eb1c63bdefc4edb8062a7` | yes |
| `assets/kenney-nature-kit/flower_purpleA.glb` | Nature Kit 2.1 | https://kenney.nl/assets/nature-kit | CC0 1.0 | 7112 | `f6fc34c96a03420a74fe36d4c2d0ec88f15204fcad99cd1416c3c4ecb22e48c4` | yes |
| `assets/kenney-nature-kit/flower_redA.glb` | Nature Kit 2.1 | https://kenney.nl/assets/nature-kit | CC0 1.0 | 7104 | `171930b7789ddbf735af3745576b5393750beb9133b9ff4a444bb6bb2986c020` | yes |
| `assets/kenney-nature-kit/flower_yellowA.glb` | Nature Kit 2.1 | https://kenney.nl/assets/nature-kit | CC0 1.0 | 7120 | `8a3b08cd2ca411c21f9c581d5bda651d78b13c50cba45ad8fa0389398ead6d1d` | yes |
| `assets/kenney-nature-kit/grass.glb` | Nature Kit 2.1 | https://kenney.nl/assets/nature-kit | CC0 1.0 | 11496 | `260e41d3e5f2472492ed7b475c5b92a30b13ce2bad408535b5ff50574d4575e7` | yes |
| `assets/kenney-nature-kit/grass_large.glb` | Nature Kit 2.1 | https://kenney.nl/assets/nature-kit | CC0 1.0 | 18504 | `af49a595624abca7249824eeefb944d4baf974abeeb5b16110d175da3563d6cd` | yes |
| `assets/kenney-nature-kit/log.glb` | Nature Kit 2.1 | https://kenney.nl/assets/nature-kit | CC0 1.0 | 14288 | `8c8fe8f6adfc03a3c0cd6cb24961ff74be96c2da284d70322f05797d049972d6` | yes |
| `assets/kenney-nature-kit/log_large.glb` | Nature Kit 2.1 | https://kenney.nl/assets/nature-kit | CC0 1.0 | 7924 | `e7a92369062d491e5a31a163d390e07db04ee573605bbfa84c00660d18896b4c` | no — kept from the first import, candidate for M2 |
| `assets/kenney-nature-kit/log_stackLarge.glb` | Nature Kit 2.1 | https://kenney.nl/assets/nature-kit | CC0 1.0 | 17604 | `58dc0ce3321b3b57f7b8c5aea47e1a212a5f462822af57a26f9ba5c4d48e65ab` | no — kept from the first import, candidate for M2 |
| `assets/kenney-nature-kit/plant_bush.glb` | Nature Kit 2.1 | https://kenney.nl/assets/nature-kit | CC0 1.0 | 4396 | `ae7b1beb39e242b13f5f29e3ec23ef21034b814f82297b8aa00a9bf4e1b09590` | yes |
| `assets/kenney-nature-kit/plant_bushLarge.glb` | Nature Kit 2.1 | https://kenney.nl/assets/nature-kit | CC0 1.0 | 6436 | `10e1d9fbf29d96d1d1a56fb2ce25ae66537505101759229afe01ae22c6c45e02` | yes |
| `assets/kenney-nature-kit/rock_largeB.glb` | Nature Kit 2.1 | https://kenney.nl/assets/nature-kit | CC0 1.0 | 8560 | `caa8b025833d4dabf6d98fe2e96cf2fbd886693ac990df0db75f9d827194374b` | yes |
| `assets/kenney-nature-kit/rock_largeE.glb` | Nature Kit 2.1 | https://kenney.nl/assets/nature-kit | CC0 1.0 | 6464 | `8207ce8100b7c756e55e67bee030edadeb332d7d72220027b5818f1987039def` | yes |
| `assets/kenney-nature-kit/stone_largeC.glb` | Nature Kit 2.1 | https://kenney.nl/assets/nature-kit | CC0 1.0 | 6580 | `f78e984f04f2c9d3a242d42b1c8f65b8a095b9ccf9f74ac55a97b7cdd1c4668c` | yes |
| `assets/kenney-nature-kit/stone_smallC.glb` | Nature Kit 2.1 | https://kenney.nl/assets/nature-kit | CC0 1.0 | 2620 | `dfc8129bc9290155c524aeaf3b845aa68eb72580afccd5b969d598294d147136` | yes |
| `assets/kenney-nature-kit/stump_round.glb` | Nature Kit 2.1 | https://kenney.nl/assets/nature-kit | CC0 1.0 | 5644 | `e9b0f385f0ef98493ef716a055aa51e0b99efb8445279be7bb8bd83329a4c4af` | yes |
| `assets/kenney-nature-kit/tree_default.glb` | Nature Kit 2.1 | https://kenney.nl/assets/nature-kit | CC0 1.0 | 9428 | `562d29638c902de3c7bee465d3a53bb77117efbc392ae04ed894faf6b5dc691d` | yes |
| `assets/kenney-nature-kit/tree_fat.glb` | Nature Kit 2.1 | https://kenney.nl/assets/nature-kit | CC0 1.0 | 5576 | `84b262c5dda3a91ac6c95f9d8b23a0ebbb1951d678c0e1375d3e32623cc43ee2` | yes |
| `assets/kenney-nature-kit/tree_oak.glb` | Nature Kit 2.1 | https://kenney.nl/assets/nature-kit | CC0 1.0 | 14644 | `d7fd8773674928c50c11b66d12c636d49bdcc15a8b1c7fbb98e6f63a3439a3f3` | yes |
| `assets/kenney-nature-kit/tree_pineRoundA.glb` | Nature Kit 2.1 | https://kenney.nl/assets/nature-kit | CC0 1.0 | 14488 | `7dc9711f31585eafdcb965d0649c30af5e19f2def1955f7a915081d30759ef8e` | yes |
| `assets/kenney-nature-kit/tree_pineTallA.glb` | Nature Kit 2.1 | https://kenney.nl/assets/nature-kit | CC0 1.0 | 7200 | `e0a56eb196d8a64ba86c7304d607136e17e6f9ad748dffcf86bd53b18b91b196` | yes |
| `assets/kenney-nature-kit/tree_simple.glb` | Nature Kit 2.1 | https://kenney.nl/assets/nature-kit | CC0 1.0 | 6500 | `93891ea740447634930de19c31a7c1c9f4add94122e6db03aca9f75aea32f9d6` | yes |
| `assets/kenney-nature-kit/tree_tall.glb` | Nature Kit 2.1 | https://kenney.nl/assets/nature-kit | CC0 1.0 | 7000 | `3515a8826044d91e84e011186c86878f62024a487a079b4e32c9ac2e71994411` | yes |
