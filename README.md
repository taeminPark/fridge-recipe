# 있는걸로

냉장고에 있는 재료를 넣으면, 그 재료와 기본 양념만으로 지금 만들 수 있는 한식 레시피를 보여주는 PWA예요. 설계는 [docs/DESIGN.md](docs/DESIGN.md)에 있어요.

- 지금 만들 수 있는 요리와 "1개만 더 있으면" 되는 요리를 나눠 보여줘요.
- 레시피: 직접 작성 43개 + 식품의약품안전처 식품안전나라 조리식품 레시피 DB 490개

## 개발

```bash
npm install
npm run dev     # 개발 서버
npm test        # 매칭·파싱 테스트 (Vitest)
npm run build
```

## 공공 레시피 다시 받기

`.env`에 식품안전나라 인증키를 넣고 실행해요. `.env`는 커밋하지 않아요.

```bash
echo "FOODSAFETY_API_KEY=발급받은키" > .env
npm run import:recipes   # src/data/recipes-foodsafety.json, scripts/unmapped.txt 갱신
```

`scripts/unmapped.txt`에 남은 재료명을 `src/data/ingredients.json`의 별칭으로 추가하면 쓸 수 있는 레시피가 늘어나요.

## 배포

`main`에 push하면 GitHub Actions가 테스트, 빌드 후 GitHub Pages에 배포해요.

출처: 식품의약품안전처 식품안전나라 조리식품 레시피 DB
