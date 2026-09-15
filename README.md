### 구조
```
src/
    index.css                    디자인 토큰 + dark variant + 컴포넌트 스타일
    config/rules.js              ★ 역할별 제약 규칙 (단일 출처)
    components/
        ui/icons.jsx               로컬 SVG 아이콘 (size 기본값 있음)
        ui/fields.jsx              TextField·SecretField·SegmentedField·Toggle 등
        ui/primitives.jsx          Card·Accordion·SectionHead·Badge 등
        ServiceCard.jsx            Backend/Gateway/Notification 공통 카드
        panels/{Overview,Services,Connectors}Panel.jsx
        ProfileDetail.jsx          탭 + 헤더
        ProfileList.jsx            검색 + 미저장 표시
        JsonPreviewPopup.jsx       드로어 + 비밀값 마스킹
        ToastAlert.jsx
    hooks/useSystemTheme.js      시스템 추종 + 수동 토글(localStorage)
    App.jsx                      헤더/셸
```

###### 규칙은 전부 config/rules.js 한 곳에 있습니다.  모듈 허용/고정, ORM 스택, 선택 섹션, 커넥터 용도 판정이 모두 여기서 나오므로 규칙이 바뀌면 이 파일만 고치면 됩니다.