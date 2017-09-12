import { GuessParser } from "../src/parser"
let p = new GuessParser();
console.log(
  p.parse(" -f google --long google")
)
console.log(
  p.parse('--title "Search by bing" --text "https://www.bing.com/search?q=__arg__"  --value "https://www.bing.com/search?q=__arg__"')
)