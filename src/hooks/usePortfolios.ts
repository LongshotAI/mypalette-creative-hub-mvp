
import { usePortfolios as useRefactoredPortfolios } from './portfolio';

export const usePortfolios = (userId: string | undefined) => {
  // Use a more direct approach without conditional warning that might trigger re-renders
  return useRefactoredPortfolios(userId);
};
