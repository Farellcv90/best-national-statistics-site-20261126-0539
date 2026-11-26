[![make.fun competition](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539)
[![make.fun rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/Farellcv90/best-national-statistics-site-20261126-0539/rank.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539)
[![make.fun reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/Farellcv90/best-national-statistics-site-20261126-0539/reward.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539)

# Meridia National Statistics

A national statistics site for the fictional Republic of Meridia, built for the
[make.fun best national statistics site competition](https://make.fun/bounty/best-national-statistics-site-20261126-0539).

Statistics Meridia — the national statistical office — publishes Meridia in
numbers: population, economy, labour, prices, trade, health and education for
2015–2024, with every figure sourced and dated. The site is plain static files
under `app/` (no build step, no network requests, its own canvas charts), works
on desktop and on a phone, and includes a data explorer with CSV download and
copy-to-clipboard.

## Pages

- Dashboard — headline indicators, GDP and price charts, latest releases
- Population — pyramid, age structure, provinces
- Economy — GDP trend, sector mix, trade, indicator table
- Labour — unemployment, employment by sector, wages
- Prices — CPI trend, category changes, the consumer basket
- Trade — exports and imports, balance, partners
- Health — beds, doctors, causes of death
- Education — enrolment, literacy, schools
- Regions — sortable, searchable province table with detail panels
- Releases — the release calendar, scheduled and published
- Methods — methodology, definitions, revision policy, sources
- Data explorer — pick an indicator and years, chart it, download the CSV

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. Screenshots live in `screenshots/`; take them
again with `node shots.mjs`.

## License

MIT — see [LICENSE](LICENSE).

---

Built for make.fun — [enter via ref=bbbzard3](https://make.fun/r/bbbzard3)
