import Validator from "validator";

class Validate {

    constructor() { }

    /**
   * @function _validations
   * @param obj 
   * @returns 
   */
    public _validations(obj: any): any {
        let _errors: any = {};

        for (const key in obj) {
            if (((obj[key]) && (obj[key] !== undefined))) {
                if (Validator.isEmpty(obj[key], { ignore_whitespace: false })) {
                    _errors[key] = `${key} is required.`;
                }
            }

            if ((obj[key] === undefined) || (obj[key] === null)) {
                _errors[key] = `${key} is required.`;
            }

            if (key === "mobile") {
                if (!Validator.isMobilePhone(obj[key])) {
                    _errors[key] = `Enter a valid ${key} number.`;
                }
            }

            if ((key === "_id") || (key === "following")) {
                if (!Validator.isMongoId(obj[key])) {
                    _errors[key] = `Enter a valid ${key}.`;
                }
            }

            if ((key === "email") && (obj[key] !== undefined)) {
                if (!Validator.isEmail(obj[key])) {
                    _errors[key] = `Enter a valid ${key}.`;
                }
            }
        }

        return _errors;
    }

}

export default new Validate();