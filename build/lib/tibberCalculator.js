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
            this.checkAndSetValue(this.getStatePrefix(homeId, `Calculations.${channel}`, "TargetState"), "EMPTY", "target state to write triggered values of this channel");
            this.checkAndSetValueNumber(this.getStatePrefix(homeId, `Calculations.${channel}`, "TriggerPrice"), 0.0, "pricelevel to trigger this channel at");
            this.checkAndSetValueBoolean(this.getStatePrefix(homeId, `Calculations.${channel}`, "Active"), false, "Whether the calculation channel is active");
        }
        catch (error) {
            this.adapter.log.warn(this.generateErrorMessage(error, "setup of states for calculator"));
        }
    }
}
exports.TibberCalculator = TibberCalculator;
//# sourceMappingURL=tibberCalculator.js.map