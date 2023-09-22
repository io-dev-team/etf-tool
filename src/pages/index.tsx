import Head from "next/head";
import { Header } from "@/components/Header";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
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
import { FeatureEnum, PeriodEnum } from "@/interfaces";
import { useEffect, useState } from "react";
import axios from "axios";

function formatPrice(x: number) {
  return x ? x.toString().replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, "$1,") : "";
}

interface IStock {
  symbol: string;
  price: string;
  dividendYield: string;
  qty: number;
  deposit: string;
  income: number;
}
type Data = { list: IStock[]; count: number } | null;
export default function Home() {
  const [amount, setAmount] = useState(1000);
  const [period, setPeriod] = useState(PeriodEnum.All);
  const [feature, setFeature] = useState(FeatureEnum.Etf);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Data>(null);

  const onSearch = async () => {
    setIsLoading(true);

    try {
      const resp = await axios.get("/api/data", {
        params: {
          feature,
          period,
          page,
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
          const income = amount;
          const count = +(amount / dividend).toFixed(2);
          const deposit = "$" + formatPrice(+(price * count).toFixed(0));
          return {
            ...item,
            price: "$" + formatPrice(+price),
            income,
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
  }, [page]);

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
          <Box
            component="form"
            sx={{
              my: 3,
              "& > :not(style)": { m: 1, width: "25ch" },
              textAlign: "center",
            }}
            noValidate
            autoComplete="off"
          >
            <FormControl fullWidth sx={{ m: 1 }}>
              <InputLabel htmlFor="outlined-adornment-amount">
                The income you want (annualy)
              </InputLabel>
              <OutlinedInput
                value={amount}
                onChange={(e) => setAmount(+e.target.value)}
                id="outlined-adornment-amount"
                startAdornment={
                  <InputAdornment position="start">$</InputAdornment>
                }
                label="The income you want (annualy)"
              />
            </FormControl>
            <FormControl fullWidth sx={{ m: 1 }}>
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
            <FormControl fullWidth sx={{ m: 1 }}>
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
          </Box>
          <Box sx={{ m: 1, position: "relative" }}>
            <Button
              size="large"
              variant="outlined"
              sx={{}}
              disabled={isLoading}
              onClick={onSearch}
            >
              Search
            </Button>
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
                        <TableCell align="right">
                          <Tooltip title="The yield returned annually as dividends">
                            <span>Annually Dividend Yield</span>
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
