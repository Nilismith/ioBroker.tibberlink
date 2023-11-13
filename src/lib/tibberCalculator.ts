import * as utils from "@iobroker/adapter-core";
import { IPrice } from "tibber-api/lib/src/models/IPrice";
import { TibberHelper, enCalcType } from "./tibberHelper";

export class TibberCalculator extends TibberHelper {
	constructor(adapter: utils.AdapterInstance) {
		super(adapter);
	}

	async setupCalculatorStates(homeId: string, channel: number): Promise<void> {
		try {
			if (this.adapter.config.CalculatorList[channel].chName === undefined) {
				this.adapter.config.CalculatorList[channel].chName = `Channel Name`;
			}
			const channelName = this.adapter.config.CalculatorList[channel].chName;

			//***  chActive  ***
			if (this.adapter.config.CalculatorList[channel].chActive === undefined) {
				this.adapter.config.CalculatorList[channel].chActive = false;
			}
			this.checkAndSetValueBoolean(
				this.getStatePrefix(homeId, `Calculations.${channel}`, `Active`, channelName),
				this.adapter.config.CalculatorList[channel].chActive,
				`Whether the calculation channel is active`,
				true,
				true,
			);
			const valueActive = await this.getStateValue(`Homes.${homeId}.Calculations.${channel}.Active`);
			if (typeof valueActive === "boolean") {
				this.adapter.config.CalculatorList[channel].chActive = valueActive;
				this.adapter.log.debug(
					`setup calculator settings state in home: ${homeId} - channel: ${channel}-${channelName} - set to Active: ${this.adapter.config.CalculatorList[channel].chActive}`,
				);
			} else {
				this.adapter.log.debug(`Wrong type for chActive: ${valueActive}`);
			}

			//
			//
			//
			await this.adapter.setObjectAsync(`Homes.${homeId}.Calculations.${10}`, {
				type: "channel",
				common: {
					name: channelName,
					desc: "BlaBlub-Test",
				},
				native: {},
			});
			//
			//
			//

			//"Best cost": Utilizes the "TriggerPrice" state as input.
			//"Best single hours": Defined by the "AmountHours" state.
			//"Best hours block": Defined by the "AmountHours" state.
			switch (this.adapter.config.CalculatorList[channel].chType) {
				case enCalcType.BestCost:
					this.adapter.delObjectAsync(this.getStatePrefix(homeId, `Calculations.${channel}`, `AmountHours`).value);

					//***  chTriggerPrice  ***
					if (this.adapter.config.CalculatorList[channel].chTriggerPrice === undefined) {
						this.adapter.config.CalculatorList[channel].chTriggerPrice = 0;
					}
					this.checkAndSetValueNumber(
						this.getStatePrefix(homeId, `Calculations.${channel}`, `TriggerPrice`),
						this.adapter.config.CalculatorList[channel].chTriggerPrice,
						`pricelevel to trigger this channel at`,
						true,
						true,
					);
					const valueTriggerPrice = await this.getStateValue(`Homes.${homeId}.Calculations.${channel}.TriggerPrice`);
					if (typeof valueTriggerPrice === "number") {
						this.adapter.config.CalculatorList[channel].chTriggerPrice = valueTriggerPrice;
						this.adapter.log.debug(
							`setup calculator settings state in home: ${homeId} - channel: ${channel}-${channelName} - set to TriggerPrice: ${this.adapter.config.CalculatorList[channel].chTriggerPrice}`,
						);
					} else {
						this.adapter.log.debug(`Wrong type for chTriggerPrice: ${valueTriggerPrice}`);
					}
					break;
				case enCalcType.BestSingleHours:
				case enCalcType.BestHoursBlock:
					this.adapter.delObjectAsync(this.getStatePrefix(homeId, `Calculations.${channel}`, `TriggerPrice`).value);

					//***  chAmountHours  ***
					if (this.adapter.config.CalculatorList[channel].chAmountHours === undefined) {
						this.adapter.config.CalculatorList[channel].chAmountHours = 0;
					}
					this.checkAndSetValueNumber(
						this.getStatePrefix(homeId, `Calculations.${channel}`, `AmountHours`),
						this.adapter.config.CalculatorList[channel].chAmountHours,
						`amount of hours to trigger this channel`,
						true,
						true,
					);
					const valueAmountHours = await this.getStateValue(`Homes.${homeId}.Calculations.${channel}.AmountHours`);
					if (typeof valueAmountHours === "number") {
						this.adapter.config.CalculatorList[channel].chAmountHours = valueAmountHours;
						this.adapter.log.debug(
							`setup calculator settings state in home: ${homeId} - channel: ${channel}-${channelName} - set to AmountHours: ${this.adapter.config.CalculatorList[channel].chAmountHours}`,
						);
					} else {
						this.adapter.log.debug(`Wrong type for chTriggerPrice: ${valueAmountHours}`);
					}

					break;
				default:
					this.adapter.log.error(`Calculator Type for channel ${channel} not set, please do!`);
			}

			//***  subscribeStates  ***
			this.adapter.subscribeStates(`Homes.${homeId}.Calculations.${channel}.*`);
			// all states changes inside the calculator channel settings namespace are subscribed
		} catch (error) {
			this.adapter.log.warn(this.generateErrorMessage(error, `setup of states for calculator`));
		}
	}

	async startCalculatorTasks(): Promise<void> {
		if (!this.adapter.config.UseCalculator) return;
		for (const channel in this.adapter.config.CalculatorList) {
			if (!this.adapter.config.CalculatorList[channel].chTargetState || !this.adapter.config.CalculatorList[channel].chTargetState.trim()) {
				this.adapter.log.warn(
					`Empty destination state in calculator channel ${channel} defined - provide correct external state - execution of channel skipped`,
				);
				continue;
			}
			try {
				switch (this.adapter.config.CalculatorList[channel].chType) {
					case enCalcType.BestCost:
						this.executeCalculatorBestCost(parseInt(channel));
						break;
					case enCalcType.BestSingleHours:
						this.executeCalculatorBestSingleHours(parseInt(channel));
						break;
					case enCalcType.BestHoursBlock:
						this.executeCalculatorBestHoursBlock(parseInt(channel));
						break;
					default:
						this.adapter.log.debug(`unknown value for calculator type: ${this.adapter.config.CalculatorList[channel].chType}`);
				}
			} catch (error: any) {
				this.adapter.log.warn(`unhandled error execute calculator channel ${channel}`);
			}
		}
	}

	async executeCalculatorBestCost(channel: number): Promise<void> {
		try {
			let valueToSet: string = "";
			// not chActive -> choose chValueOff
			if (!this.adapter.config.CalculatorList[channel].chActive) {
				valueToSet = this.adapter.config.CalculatorList[channel].chValueOff;
			} else {
				// chActive -> choose desired value
				const currentPrice = await this.getStateValue(`Homes.${this.adapter.config.CalculatorList[channel].chHomeID}.CurrentPrice.total`);
				if (this.adapter.config.CalculatorList[channel].chTriggerPrice > currentPrice) {
					valueToSet = this.adapter.config.CalculatorList[channel].chValueOn;
				} else {
					valueToSet = this.adapter.config.CalculatorList[channel].chValueOff;
				}
			}
			this.adapter.setForeignStateAsync(this.adapter.config.CalculatorList[channel].chTargetState, convertValue(valueToSet));
			this.adapter.log.debug(
				`calculator channel: ${channel}-best price; setting state: ${this.adapter.config.CalculatorList[channel].chTargetState} to ${valueToSet}`,
			);
		} catch (error) {
			this.adapter.log.warn(this.generateErrorMessage(error, `execute calculator for best price in channel ${channel}`));
		}
	}

	async executeCalculatorBestSingleHours(channel: number): Promise<void> {
		try {
			let valueToSet: string = "";
			// not chActive -> choose chValueOff
			if (!this.adapter.config.CalculatorList[channel].chActive) {
				valueToSet = this.adapter.config.CalculatorList[channel].chValueOff;
			} else {
				// chActive -> choose desired value
				const jsonPrices: IPrice[] = JSON.parse(
					await this.getStateValue(`Homes.${this.adapter.config.CalculatorList[channel].chHomeID}.PricesToday.jsonBYpriceASC`),
				);
				// get first n entries und test for matching hour
				const n = this.adapter.config.CalculatorList[channel].chAmountHours;
				const result: boolean[] = jsonPrices.slice(0, n).map((entry: IPrice) => checkHourMatch(entry));

				// identify if any element is true
				if (result.some((value) => value)) {
					valueToSet = this.adapter.config.CalculatorList[channel].chValueOn;
				} else {
					valueToSet = this.adapter.config.CalculatorList[channel].chValueOff;
				}
				this.adapter.setForeignStateAsync(this.adapter.config.CalculatorList[channel].chTargetState, convertValue(valueToSet));
				this.adapter.log.debug(
					`calculator channel: ${channel}-best single hours; setting state: ${this.adapter.config.CalculatorList[channel].chTargetState} to ${valueToSet}`,
				);
			}
		} catch (error) {
			this.adapter.log.warn(this.generateErrorMessage(error, `execute calculator for best single hours in channel ${channel}`));
		}
	}

	async executeCalculatorBestHoursBlock(channel: number): Promise<void> {
		try {
			let valueToSet: string = "";
			// not chActive -> choose chValueOff
			if (!this.adapter.config.CalculatorList[channel].chActive) {
				valueToSet = this.adapter.config.CalculatorList[channel].chValueOff;
			} else {
				//const currentDateTime = new Date();
				const jsonPrices: IPrice[] = JSON.parse(
					await this.getStateValue(`Homes.${this.adapter.config.CalculatorList[channel].chHomeID}.PricesToday.json`),
				);
				let minSum = Number.MAX_VALUE;
				let startIndex = 0;
				const n = this.adapter.config.CalculatorList[channel].chAmountHours;

				for (let i = 0; i < jsonPrices.length - n + 1; i++) {
					let sum = 0;
					for (let j = i; j < i + n; j++) {
						sum += jsonPrices[j].total;
					}
					if (sum < minSum) {
						minSum = sum;
						startIndex = i;
					}
				}
				const minSumEntries: boolean[] = jsonPrices.slice(startIndex, startIndex + n).map((entry: IPrice) => checkHourMatch(entry));

				// function to check for equal hour values
				//function checkHourMatch(entry: IPrice): boolean {
				//const startDateTime = new Date(entry.startsAt);
				//return currentDateTime.getHours() === startDateTime.getHours();
				//}

				// identify if any element is true
				if (minSumEntries.some((value) => value)) {
					valueToSet = this.adapter.config.CalculatorList[channel].chValueOn;
				} else {
					valueToSet = this.adapter.config.CalculatorList[channel].chValueOff;
				}
			}
			this.adapter.setForeignStateAsync(this.adapter.config.CalculatorList[channel].chTargetState, convertValue(valueToSet));
			this.adapter.log.debug(
				`calculator channel: ${channel}-best hours block; setting state: ${this.adapter.config.CalculatorList[channel].chTargetState} to ${valueToSet}`,
			);
		} catch (error) {
			this.adapter.log.warn(this.generateErrorMessage(error, `execute calculator for best hours block in channel ${channel}`));
		}
	}
}

// function to check for equal hour values of given to current
function checkHourMatch(entry: IPrice): boolean {
	const currentDateTime = new Date();
	const startDateTime = new Date(entry.startsAt);
	return currentDateTime.getHours() === startDateTime.getHours();
}

function convertValue(Value: string): boolean | number | string {
	if (Value.toLowerCase() === "true") {
		return true;
	} else if (Value.toLowerCase() === "false") {
		return false;
	} else {
		const numericValue = parseFloat(Value);
		return isNaN(numericValue) ? Value : numericValue;
	}
}
