import { FormatingNumber } from './formating-number.pipe';
import { NgModule } from "@angular/core";
import { HTMLSafePipe } from "./htmlSafe.pipe";
import { CustomCurrencyPipe } from './custom-currency.pipe';
import { RomanNumeralPipe } from './roman-numeral.pipe';
import { CustomSplitPipe } from './custom-split.pipe';

@NgModule({
  declarations: [ HTMLSafePipe, FormatingNumber, CustomCurrencyPipe, RomanNumeralPipe, CustomSplitPipe ],
  exports: [ HTMLSafePipe,FormatingNumber, CustomCurrencyPipe, RomanNumeralPipe, CustomSplitPipe  ]
})
export class PipesModule {}
