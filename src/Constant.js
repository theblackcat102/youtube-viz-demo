
export const regionMapping = {
    GB: "Europe",
    CH: "Europe",
    NL: "Europe",
    IE: "Europe",
    DE: "Europe",
    DK: "Europe",
    RU: "Europe",
    IT: "Europe",
    FR: "Europe",
    SK: "Europe",
    GR: "Europe",
    PT: "Europe",
    SG: "Asia",
    HK: "Asia",
    VN: "Asia",
    MY: "Asia",
    IN: "Asia",
    ID: "Asia",
    PH: "Asia",
    KZ: "Asia",
    AE: "Asia",
    TH: "Asia",
    JP: "Asia",
    TW: "Asia",
    US: "North America",
    PR: "North America",
    PA: "North America",
    CA: "North America",
    MX: "North America",
    BR: "South America",
    AR: "South America",
    AU: "Oceania",
    NZ: "Oceania"
};
export const categoryMapping = {
    1: 1,
    10: 1,
    17: 3,
    20: 1,
    22: 2,
    23: 1,
    24: 1,
    25: 3,
    26: 2,
    28: 3
};
export const category2Name = {
2 : 'Autos & Vehicles',
1 : ' Film & Animation',
10 : 'Music',
15 : 'Pets & Animals',
17 : 'Sports',
18 : 'Short Movies',
19 : 'Travel & Events',
20 : 'Gaming',
21 : 'Videoblogging',
22 : 'People & Blogs',
23 : 'Comedy',
24 : 'Entertainment',
25 : 'News & Politics',
26 : 'Howto & Style',
27 : 'Education',
28 : 'Science & Technology',
29 : 'Nonprofits & Activism',
30 : 'Movies',
31 : 'Anime/Animation',
32 : 'Action/Adventure',
33 : 'Classics',
34 : 'Comedy',
35 : 'Documentary',
36 : 'Drama',
37 : 'Family',
38 : 'Foreign',
39 : 'Horror',
40 : 'Sci-Fi/Fantasy',
41 : 'Thriller',
42 : 'Shorts',
43 : 'Shows',
44 : 'Trailers',

}
export const categoryMappingName = {
  1: 'Entertainment',
  2: 'People & Blogs',
  3: 'News & Politics'
}

const BASE_URL = "https://api.notify.institute";
export const MAIN_URL = BASE_URL + "/main"
export const REGION_URL = BASE_URL + "/region"
export const TAG_URL = BASE_URL + "/tag"
