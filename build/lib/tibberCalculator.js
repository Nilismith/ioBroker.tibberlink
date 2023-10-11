"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TibberCalculator = void 0;
const tibberHelper_1 = require("./tibberHelper");
class TibberCalculator extends tibberHelper_1.TibberHelper {
    constructor(adapter) {
        super(adapter);
    }
    async setupCalculatorStates(homeId, channel) {
        try {
            if (this.adapter.config.CalculatorList[channel].chTriggerPrice === undefined) {
                this.adapter.config.CalculatorList[channel].chTriggerPrice = 0;
            }
            this.checkAndSetValueNumber(this.getStatePrefix(homeId, `Calculations.${channel}`, `TriggerPrice`), this.adapter.config.CalculatorList[channel].chTriggerPrice, `pricelevel to trigger this channel at`, true, true);
            this.checkAndSetValueBoolean(this.getStatePrefix(homeId, `Calculations.${channel}`, `Active`), this.adapter.config.CalculatorList[channel].chActive, `Whether the calculation channel is active`, true, true);
            if (this.adapter.config.CalculatorList[channel].chAmountHours === undefined) {
                this.adapter.config.CalculatorList[channel].chAmountHours = 0;
            }
            this.checkAndSetValueNumber(this.getStatePrefix(homeId, `Calculations.${channel}`, `AmountHours`), this.adapter.config.CalculatorList[channel].chAmountHours, `amount of hours to trigger this channel`, true, true);
            this.adapter.subscribeStates(`Homes.${homeId}.Calculations.${channel}.*`);
            // all states changes inside the calculator channel settings namespace are subscribed
        }
        catch (error) {
            this.adapter.log.warn(this.generateErrorMessage(error, `setup of states for calculator`));
        }
    }
    async startCalculatorTasks() {
        if (this.adapter.config.UseCalculator) {
            for (const channel in this.adapter.config.CalculatorList) {
                //
                this.adapter.log.debug(`execute calculator channel: ${channel} type: ${this.adapter.config.CalculatorList[channel].chType}`);
                //
                try {
                    if (this.adapter.config.CalculatorList[channel].chActive) {
                        switch (this.adapter.config.CalculatorList[channel].chType) {
                            case tibberHelper_1.enCalcType.BestCost:
                                this.executeCalculatorBestCost(parseInt(channel));
                                break;
                            case tibberHelper_1.enCalcType.BestSingleHours:
                                //tibberCalculator.executeCalculatorBestSingleHours(parseInt(channel));
                                break;
                            case tibberHelper_1.enCalcType.BestHoursBlock:
                                //tibberCalculator.executeCalculatorBestHoursBlock(parseInt(channel));
                                break;
                            default:
                                this.adapter.log.debug(`unknown value for calculator type: ${this.adapter.config.CalculatorList[channel].chType}`);
                        }
                    }
                }
                catch (error) {
                    this.adapter.log.warn(`unhandled error execute calculator channel ${channel}`);
                }
            }
        }
    }
    async executeCalculatorBestCost(channel) {
        try {
            this.adapter.log.debug(`try execute calculator type: BestCost`);
            if (this.adapter.config.CalculatorList[channel].chTriggerPrice >
                (await this.getStateValue(`Homes.${this.adapter.config.CalculatorList[channel].chHomeID}.CurrentPrice.total`))) {
                this.adapter.setForeignStateAsync(this.adapter.config.CalculatorList[channel].chTargetState, convertValue(this.adapter.config.CalculatorList[channel].chValueOn));
            }
            else {
                this.adapter.setForeignStateAsync(this.adapter.config.CalculatorList[channel].chTargetState, convertValue(this.adapter.config.CalculatorList[channel].chValueOff));
            }
            this.adapter.log.debug(`calculator channel ${channel} set state ${this.adapter.config.CalculatorList[channel].chTargetState}`);
        }
        catch (error) {
            this.adapter.log.warn(this.generateErrorMessage(error, `execute calculator for best price in channel ${channel}`));
        }
    }
    async executeCalculatorBestSingleHours(channel) {
        try {
        }
        catch (error) {
            this.adapter.log.warn(this.generateErrorMessage(error, `execute calculator for best single hours in channel ${channel}`));
        }
    }
    async executeCalculatorBestHoursBlock(channel) {
        try {
        }
        catch (error) {
            this.adapter.log.warn(this.generateErrorMessage(error, `execute calculator for best hours block in channel ${channel}`));
        }
    }
}
exports.TibberCalculator = TibberCalculator;
function convertValue(Value) {
    if (Value.toLowerCase() === "true") {
        return true;
    }
    else if (Value.toLowerCase() === "false") {
        return false;
    }
    else {
        const numericValue = parseFloat(Value);
        return isNaN(numericValue) ? Value : numericValue;
    }
}
//# sourceMappingURL=tibberCalculator.js.map