import type { NextApiRequest, NextApiResponse } from "next";
import { GetList } from "../../api";
import { FeatureEnum, OrderBy, PeriodEnum, SortBy } from "@/interfaces";

type Data = {
  data: {
    list: any[];
    page: number;
    count: number;
  } | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { feature, period, page, sortBy, orderBy } = req.query;
    const asset = (feature as string) || FeatureEnum.Etf;
    const freq = (period as string) || PeriodEnum.All;
    const sort = (sortBy as string) || SortBy.DividendYield;
    const order = (orderBy as string) || OrderBy.Desc;
    const data = await GetList(asset, freq, page ? +page : 1, sort, order);
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ data: null });
  }
}
