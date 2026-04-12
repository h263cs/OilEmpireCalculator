export namespace main {
	
	export class BatchCalculateParams {
	    rate_per_second: number;
	    current_cash: number;
	    cash_per_unit: number;
	    boost_percent: number;
	    gas_amount_str: string;
	    goal_amount_str: string;
	    drill_selections: any[];
	
	    static createFrom(source: any = {}) {
	        return new BatchCalculateParams(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.rate_per_second = source["rate_per_second"];
	        this.current_cash = source["current_cash"];
	        this.cash_per_unit = source["cash_per_unit"];
	        this.boost_percent = source["boost_percent"];
	        this.gas_amount_str = source["gas_amount_str"];
	        this.goal_amount_str = source["goal_amount_str"];
	        this.drill_selections = source["drill_selections"];
	    }
	}
	export class DrillAffordResult {
	    total_cost: number;
	    time_left: string;
	
	    static createFrom(source: any = {}) {
	        return new DrillAffordResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.total_cost = source["total_cost"];
	        this.time_left = source["time_left"];
	    }
	}
	export class CalculationResult {
	    petrol_per_hr: number;
	    cash_per_hr: number;
	
	    static createFrom(source: any = {}) {
	        return new CalculationResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.petrol_per_hr = source["petrol_per_hr"];
	        this.cash_per_hr = source["cash_per_hr"];
	    }
	}
	export class BatchCalculationResult {
	    production: CalculationResult;
	    gas_profit: number;
	    goal_time: string;
	    drill_time: DrillAffordResult;
	
	    static createFrom(source: any = {}) {
	        return new BatchCalculationResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.production = this.convertValues(source["production"], CalculationResult);
	        this.gas_profit = source["gas_profit"];
	        this.goal_time = source["goal_time"];
	        this.drill_time = this.convertValues(source["drill_time"], DrillAffordResult);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class Config {
	    rate_per_second: number;
	    boost_percent: number;
	    cash_per_unit: number;
	    current_cash: number;
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.rate_per_second = source["rate_per_second"];
	        this.boost_percent = source["boost_percent"];
	        this.cash_per_unit = source["cash_per_unit"];
	        this.current_cash = source["current_cash"];
	    }
	}
	export class DrillSize {
	    width: number;
	    height: number;
	
	    static createFrom(source: any = {}) {
	        return new DrillSize(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.width = source["width"];
	        this.height = source["height"];
	    }
	}
	export class Drill {
	    Name: string;
	    Price: number;
	    rate: number;
	    size: DrillSize;
	
	    static createFrom(source: any = {}) {
	        return new Drill(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Price = source["Price"];
	        this.rate = source["rate"];
	        this.size = this.convertValues(source["size"], DrillSize);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	

}

