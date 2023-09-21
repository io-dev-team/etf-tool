import { FeatureEnum, PeriodEnum } from "@/interfaces";
import axios from "axios";
import * as cheerio from "cheerio";

const baseURL = "https://www.dividend.com";

const api = axios.create({
  baseURL,
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
  },
});

const createRequest =
  (method: string, url: string) =>
  async (body = {}) => {
    try {
      const resp = await api.request({
        url,
        method,
        data: body,
      });
      if (resp.data) {
        return resp.data;
      } else {
        return null;
      }
    } catch (error: any) {
      console.log(error.response.data);
      return null;
    }
  };

const Tables = {
  [FeatureEnum.Etf]: "CollectionMergedETFs", // CollectionMergedActiveETFs
  [FeatureEnum.Stock]: "CollectionMergedStocks",
};
const FreqValues = {
  [PeriodEnum.Monthly]: "12",
  [PeriodEnum.BiMonthly]: "6",
  [PeriodEnum.SemiAnnually]: "2",
  [PeriodEnum.Quartely]: "4",
  [PeriodEnum.Yearly]: "1",
};

const API = {
  GetListAsHtml: createRequest("POST", `/api/t2/body.html`),
  GetTotalCount: createRequest("POST", `/api/t2/total_count/`),
};

export const GetList = async (
  feature: string,
  period: string,
  page: number
) => {
  const filter = {};

  if (period !== PeriodEnum.All) {
    // @ts-ignore
    filter["FilterPayoutFrequency"] = {
      filterKey: "FilterPayoutFrequency",
      selected: true,
      // @ts-ignore
      value: [FreqValues[period]],
      type: "",
    };
  }

  const [data, count] = await Promise.all([
    API.GetListAsHtml({
      uuid: "Merged-SEOTable",
      default_filters: [],
      filters: {
        ...filter,
      },
      tab: "TblTabDivMergedOverviewSEO",
      page: page,
      // @ts-ignore
      collection: Tables[feature],
      sort_by: {
        DividendYieldCurrent: "desc",
      },
      theme: "FIN::L2(High Yield Dividend)",
      modal_key: null,
      modal_keyword: null,
      special_theme: "",
      // "ad_unit_full_path": "/2143012/Div/Theme/HighYield",
      no_content_tray_ads_in_table: false,
    }),
    API.GetTotalCount({
      uuid: "Merged-SEOTable",
      // @ts-ignore
      collection: Tables[feature],
      default_filters: [],
      filters: {
        ...filter,
      },
      theme: "FIN::L2(High Yield Dividend)",
    }),
  ]);

  if (data && count) {
    // console.log(data.length);
    // console.log(count);

    const $ = cheerio.load(data);
    const rows = $(".mp-table-body-row-container");
    const list: any[] = [];

    rows.each((index, element) => {
      const row = $(element);
      const name = row.find(".m-table-body-subtext span").eq(0).text();
      const price = row.find(".m-table-body-text").eq(0).text();
      const marketCap = row.find(".m-table-body-text").eq(1).text();
      const dividendYield = row.find(".m-table-body-text").eq(2).text();
      const exDivDate = row.find(".m-table-body-text").eq(3).text();

      if (name) {
        // console.log(
        //   `Name: ${name}, Price: ${price}, Dividend Yield: ${dividendYield}`
        // );
        list.push({
          symbol: name,
          price,
          dividendYield,
        });
      }
    });

    return { list, page, count: count.total };
  } else {
    // console.log("NO DATA");
    return null;
  }
};
