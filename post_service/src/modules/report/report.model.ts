import * as Interfaces from '../../interfaces';
import Report from './report.schema';
import { Helper } from '../../helpers';

const {
    Response: { errors },
    Validate: { _validations },
    ResMsg: {
        errors: { SOMETHING_WENT_WRONG, ALL_FIELDS_ARE_REQUIRED } 
    } 
} = Helper;

class ReportModel {

    constructor() { }

    /**
   * @function reportPost
   * @param _report
   * @returns reported post
   */
    public async reportPost(_report: Interfaces.Report): Promise<any> {
        try {
            const { post, user, category, explanation } = _report;
            const _errors = await _validations({ post, category, explanation });
            if (Object.keys(errors).length > 0) return errors(ALL_FIELDS_ARE_REQUIRED, _errors);

            const reportPost = new Report({ isPostReported: true, post, user, category, explanation });
            return reportPost.save();
        } catch (error) {
            return errors(SOMETHING_WENT_WRONG, error);
        }
    }
 
}

export default new ReportModel();