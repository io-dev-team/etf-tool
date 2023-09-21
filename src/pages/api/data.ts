import type { NextApiRequest, NextApiResponse } from "next";
import { GetList } from "../../api";
import { FeatureEnum, PeriodEnum } from "@/interfaces";

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
    const { feature, period, page } = req.query;
    const asset = (feature as string) || FeatureEnum.Etf;
    const freq = (period as string) || PeriodEnum.All;
    const data = await GetList(asset, freq, page ? +page : 1);
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ data: null });
  }
}
