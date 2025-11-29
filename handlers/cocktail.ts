import axios from 'axios';
import { translate } from '@vitalets/google-translate-api';
import { BotContext } from '../types';

interface CocktailResponse {
  drinks: Array<{
    strDrink: string;
    strDrinkThumb: string;
    strInstructions: string;
    strIngredient1?: string;
    strIngredient2?: string;
    strIngredient3?: string;
    strIngredient4?: string;
    strIngredient5?: string;
    strIngredient6?: string;
    strIngredient7?: string;
    strIngredient8?: string;
    strIngredient9?: string;
    strIngredient10?: string;
    strIngredient11?: string;
    strIngredient12?: string;
    strIngredient13?: string;
    strIngredient14?: string;
    strIngredient15?: string;
    strMeasure1?: string;
    strMeasure2?: string;
    strMeasure3?: string;
    strMeasure4?: string;
    strMeasure5?: string;
    strMeasure6?: string;
    strMeasure7?: string;
    strMeasure8?: string;
    strMeasure9?: string;
    strMeasure10?: string;
    strMeasure11?: string;
    strMeasure12?: string;
    strMeasure13?: string;
    strMeasure14?: string;
    strMeasure15?: string;
  }>;
}

/**
 * Fetches a random cocktail recipe from TheCocktailDB API
 */
async function fetchCocktail(): Promise<{ name: string; imageUrl: string; recipe: string }> {
  try {
    const response = await axios.get<CocktailResponse>('https://www.thecocktaildb.com/api/json/v1/1/random.php');
    const cocktail = response.data.drinks[0];
    
    // Build ingredients list
    const ingredients: string[] = [];
    for (let i = 1; i <= 15; i++) {
      const ingredient = cocktail[`strIngredient${i}` as keyof typeof cocktail] as string;
      const measure = cocktail[`strMeasure${i}` as keyof typeof cocktail] as string;
      if (ingredient && ingredient.trim()) {
        const ingredientLine = measure ? `${measure.trim()} ${ingredient.trim()}` : ingredient.trim();
        ingredients.push(ingredientLine);
      }
    }
    
    const recipe = `🍹 ${cocktail.strDrink}\n\n📋 Ингредиенты:\n${ingredients.map(ing => `• ${ing}`).join('\n')}\n\n📝 Инструкция:\n${cocktail.strInstructions}`;
    
    return {
      name: cocktail.strDrink,
      imageUrl: cocktail.strDrinkThumb,
      recipe: recipe
    };
  } catch (error) {
    console.error('Error fetching cocktail:', error);
    throw new Error('Failed to fetch cocktail recipe');
  }
}

/**
 * Processes a request for a random cocktail recipe with image.
 */
export async function handleCocktail(
  ctx: BotContext,
  generatingMessage: string,
  errorMessage: string
): Promise<void> {
  await ctx.reply(generatingMessage);
  
  try {
    const cocktailData = await fetchCocktail();
    
    // Translate recipe to Russian
    const { text: translatedRecipe } = await translate(cocktailData.recipe, { to: 'ru' });
    
    // Send photo with recipe as caption
    await ctx.replyWithPhoto(cocktailData.imageUrl, {
      caption: translatedRecipe
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in obtaining a cocktail recipe:', errorMsg);
    await ctx.reply(errorMessage);
  }
}

