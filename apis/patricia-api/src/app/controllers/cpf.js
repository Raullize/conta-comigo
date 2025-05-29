import *as Yup from 'yup';

export const cpfSchema = Yup.string().length(11).matches(/^\d+$/);
