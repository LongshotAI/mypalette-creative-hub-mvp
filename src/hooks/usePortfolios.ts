
import { usePortfolios as useRefactoredPortfolios } from './portfolio';

export const usePortfolios = (userId: string) => {
  return useRefactoredPortfolios(userId);
};
