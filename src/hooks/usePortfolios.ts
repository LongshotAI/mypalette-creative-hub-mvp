
import { usePortfolios as useRefactoredPortfolios } from './portfolio';

export const usePortfolios = (userId: string) => {
  if (!userId) {
    console.warn('usePortfolios called without userId');
  }
  return useRefactoredPortfolios(userId);
};
