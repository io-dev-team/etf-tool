import Head from "next/head";
import { Header } from "@/components/Header";
import { styled } from "@mui/material/styles";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { FeatureEnum, OrderBy, PeriodEnum, SortBy } from "@/interfaces";
import { useEffect, useState } from "react";
import axios from "axios";

function formatPrice(x: number) {
  return x ? x.toString().replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, "$1,") : "";
}

const FormRoot = styled("form")(({ theme }) => ({
  my: 3,
  "& > :not(style)": { m: 1, width: "25ch" },
  textAlign: "center",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-end",
  flexDirection: "row",
  gap: "20px",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
  },
  [theme.breakpoints.up("md")]: {
    flexDirection: "row",
  },
}));

interface IStock {
  symbol: string;
  price: string;
  dividendYield: string;
  qty: number;
  deposit: string;
  marketCap: string;
}
type Data = { list: IStock[]; count: number } | null;
export default function Home() {
  const [amount, setAmount] = useState(100);
  const [amountType, setAmountType] = useState(PeriodEnum.Monthly);
  const [period, setPeriod] = useState(PeriodEnum.All);
  const [feature, setFeature] = useState(FeatureEnum.Etf);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Data>(null);
  const [sortBy, setSortBy] = useState(SortBy.DividendYield);
  const [orderBy, setOrderBy] = useState(OrderBy.Desc);

  const onSearch = async () => {
    setIsLoading(true);

    try {
      const resp = await axios.get("/api/data", {
        params: {
          feature,
          period,
          page,
          sortBy,
          orderBy,
        },
      });

      const { list, count } = resp.data.data;

      setData({
        count,
        list: list.map((item: IStock) => {
          const price = +item.price.split("$")[1];
          const dividend = +(
            (price / 100) *
            +item.dividendYield.split("%")[0]
          ).toFixed(4);
          let amountAnnually =
            amountType === PeriodEnum.Monthly ? amount * 12 : amount;
          const count = +(amountAnnually / dividend).toFixed(2);
          const deposit = "$" + formatPrice(+(price * count).toFixed(2));
          return {
            ...item,
            price: "$" + formatPrice(+price),
            deposit,
            qty: count,
          };
        }),
      });
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    onSearch();
  }, [page, sortBy, orderBy]);

  useEffect(() => {
    setData((data) => {
      if (!data) return null;

      return {
        count: data.count,
        list: data.list.map((item: IStock) => {
          const price = +item.price.split("$")[1];
          const dividend = +(
            (price / 100) *
            +item.dividendYield.split("%")[0]
          ).toFixed(4);
          let amountAnnually =
            amountType === PeriodEnum.Monthly ? amount * 12 : amount;
          const count = +(amountAnnually / dividend).toFixed(2);
          const deposit = "$" + formatPrice(+(price * count).toFixed(2));
          return {
            ...item,
            price: "$" + formatPrice(+price),
            deposit,
            qty: count,
          };
        }),
      };
    });
  }, [amount, amountType]);

  return (
    <>
      <Head>
        <title>ETF/STOCK TOOL</title>
        <meta name="description" content="Etf/Stock tool" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <Container
        maxWidth="xl"
        sx={{
          py: 10,
        }}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h3" gutterBottom>
            Tool for investing in etf and stocks
          </Typography>
          <FormRoot noValidate autoComplete="off">
            <Box>
              <FormControl fullWidth sx={{ my: 2 }}>
                <TextField
                  value={amount}
                  onChange={(e) => setAmount(+e.target.value)}
                  id="outlined-adornment-amount"
                  inputProps={{
                    style: { textAlign: "center" },
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    step: 10,
                    min: 10,
                  }}
                  type="number"
                  label="The income you want $"
                />
              </FormControl>
              <FormControl fullWidth>
                <TextField
                  select
                  label="Income period"
                  value={amountType}
                  onChange={(e) => {
                    setAmountType(e.target.value as PeriodEnum);
                  }}
                >
                  {Object.values(PeriodEnum)
                    .filter((v) =>
                      [PeriodEnum.Monthly, PeriodEnum.Yearly].includes(v)
                    )
                    .map((v) => (
                      <MenuItem key={v} value={v}>
                        {v}
                      </MenuItem>
                    ))}
                </TextField>
              </FormControl>
            </Box>
            <FormControl fullWidth>
              <TextField
                select
                label="Dividend payment period"
                value={period}
                onChange={(e) => {
                  setPage(1);
                  setPeriod(e.target.value as PeriodEnum);
                }}
              >
                {Object.values(PeriodEnum).map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
            <FormControl fullWidth>
              <TextField
                select
                label="Select feature"
                value={feature}
                onChange={(e) => {
                  setPage(1);
                  setFeature(e.target.value as FeatureEnum);
                }}
              >
                {Object.values(FeatureEnum).map((v) => (
                  <MenuItem key={v} value={v}>
                    {v}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>
          </FormRoot>
          <Box sx={{ m: 2, display: "flex", gap: "10px" }}>
            <Button
              size="large"
              variant="outlined"
              disabled={isLoading}
              onClick={() => {
                setPage(1);
                onSearch();
              }}
            >
              Search
            </Button>
            {/* <Button
              size="large"
              color="warning"
              variant="outlined"
              disabled={isLoading}
              onClick={() => {
                setPage(1);
                setSortBy(SortBy.DividendYield);
                setOrderBy(OrderBy.Desc);
                onSearch();
              }}
            >
              Reset
            </Button> */}
          </Box>
          <Box
            sx={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            {isLoading ? (
              <CircularProgress
                size={24}
                sx={{
                  my: 20,
                  color: "green",
                }}
              />
            ) : data ? (
              <Paper sx={{ width: "100%", overflow: "hidden" }}>
                <TableContainer sx={{ width: "100%", maxHeight: 500 }}>
                  <Table
                    stickyHeader
                    sx={{ width: "100%", pr: 3 }}
                    aria-label="simple table"
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <Tooltip title="The unique identifier for each stock or ETF">
                            <span>Symbol</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="The current price of the stock or ETF">
                            <span>Price</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="The market cap of the stock or ETF">
                            <span
                              onClick={() => {
                                if (sortBy === SortBy.MarketCap) {
                                  setOrderBy(
                                    orderBy === OrderBy.Desc
                                      ? OrderBy.Asc
                                      : OrderBy.Desc
                                  );
                                } else {
                                  setSortBy(SortBy.MarketCap);
                                  setOrderBy(OrderBy.Desc);
                                }
                              }}
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "center",
                              }}
                            >
                              {sortBy === SortBy.MarketCap && (
                                <>
                                  {orderBy === OrderBy.Desc ? (
                                    <ArrowDownwardIcon />
                                  ) : (
                                    <ArrowUpwardIcon />
                                  )}
                                </>
                              )}{" "}
                              Market cap
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="The yield returned annually as dividends">
                            <span
                              onClick={() => {
                                if (sortBy === SortBy.DividendYield) {
                                  setOrderBy(
                                    orderBy === OrderBy.Desc
                                      ? OrderBy.Asc
                                      : OrderBy.Desc
                                  );
                                } else {
                                  setSortBy(SortBy.DividendYield);
                                  setOrderBy(OrderBy.Desc);
                                }
                              }}
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "center",
                              }}
                            >
                              {sortBy === SortBy.DividendYield && (
                                <>
                                  {orderBy === OrderBy.Desc ? (
                                    <ArrowDownwardIcon />
                                  ) : (
                                    <ArrowUpwardIcon />
                                  )}
                                </>
                              )}{" "}
                              Annually Dividend Yield
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="The number of shares you would get for your deposit">
                            <span>Deposit (quantity)</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="The total amount of money required for the deposit">
                            <span>Deposit (total amount)</span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.list.map((item) => (
                        <TableRow
                          hover
                          key={item.symbol}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell component="th" scope="row">
                            {item.symbol}
                          </TableCell>
                          <TableCell align="right">{item.price}</TableCell>
                          <TableCell align="right">{item.marketCap}</TableCell>
                          <TableCell align="right">
                            {item.dividendYield}
                          </TableCell>
                          <TableCell align="right">{item.qty}</TableCell>
                          <TableCell align="right">{item.deposit}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[30]}
                  component="div"
                  count={data.count}
                  rowsPerPage={data.list.length}
                  page={page - 1}
                  onPageChange={(e, p) => setPage(p + 1)}
                />
              </Paper>
            ) : (
              <>No data</>
            )}
          </Box>
        </Box>
      </Container>
    </>
  );
}
