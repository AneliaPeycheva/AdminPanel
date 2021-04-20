import { Injectable } from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';


declare var sha1;

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  logged:any = false;
  username:any;
  name:any;
  recipes:any = [];
  recipesOnPage = 9;
  allPagesCount:number = 0;

  constructor(private http:HttpClient) {    
    this.GetRecipes(); 
   }

  GetRecipes() {
    this.http.get("api/admin-service.php?action=get_recipes")
    .subscribe(response => {    
      this.recipes = response['recipes']; 
      err => console.error(err);       
    })    
  }

  CreateNewRecipe(imgObj, title, description, ingredients, difficulty, preparation, portion, modal) {  
    let params = [ { image:"" }, { image:"" }, { image:"" }, { image:"" } , { image:"" }];
    for(let i = 1; i <= 5; i++){
      if(imgObj.images_filled[i - 1] != "") { params[i - 1]['image'] = imgObj.images[i - 1] }
    } 
    this.http.post("api/admin-service.php?action=add_recipe&title=" + title + "&description=" + description + "&ingredients=" + ingredients + "&difficulty=" +  difficulty + "&preparation=" + preparation + '&portion=' + portion, params)
    .subscribe(response => {  
      console.log(response);                  
      modal.CloseModal();  
      this.GetRecipes();             

    })
  }

  DeleteRecipe(uid) {  
    this.http.get("api/admin-service.php?action=delete_recipe&uid=" + uid)
    .subscribe(response => {
      this.GetRecipes(); 
    })
  }

  EditRecipeById(imgObj, uid, title, description, ingredients, difficulty, preparation, portion, modal) {
    let params = [ { image:"" }, { image:"" }, { image:"" }, { image:"" } , { image:"" }];
    for(let i = 1; i <= 5; i++){
      if(imgObj.images_filled[i - 1] != "") { params[i - 1]['image'] = imgObj.images[i - 1] }
    } 
    console.log(params);
    this.http.post("api/admin-service.php?action=edit_recipe&uid=" + uid + "&title=" + title + "&description=" + description + "&ingredients=" + ingredients + "&difficulty=" +  difficulty + "&preparation=" + preparation + '&portion=' + portion, params)
    .subscribe(response => {
      console.log(response);    
      modal.CloseModal();
      this.GetRecipes(); 
    })
    
  }

  Login(username,password,ctx) {
    if (!username || !password) {
      alert('Wrong data');
    } else {
      this.http.get("api/admin-service.php?action=login" + "&username=" + username + "&password=" + sha1(password))
      .subscribe(response => {    
        if (response['logged'] == true) {
          this.logged = true;  
          this.username = response['username'];   
          this.name = response['name'];
          this.GetRecipes();         
          ctx.username = "";
          ctx.password = "";
        }    
      })
    }    
  }

  Logout() {
    this.http.get("api/admin-service.php?action=logout")
    .subscribe(response => {  
        this.logged = response['logged'];          
    })
  }



  ReturnLogged() {
    return this.logged;
  }

  ReturnRecipes(page,textToSearch){
    if (textToSearch == "") {
      if (this.recipes.length > 0) {
        return this.recipes.slice(page * this.recipesOnPage, (page + 1) * this.recipesOnPage); 
      } else {
        return "";
      }      
    } else {
      return this.recipes.filter(recipe => recipe.title.includes(textToSearch)).slice(page * this.recipesOnPage, (page + 1) * this.recipesOnPage);
    }
    
  }

  ReturnRecipesPages(textToSearch) {
    let arr = [];
    let finded = this.recipes.filter(recipe => recipe.title.includes(textToSearch));
    if (textToSearch == "" ) {
      if (this.recipes.length > 0) {
        let calcPages = Math.ceil(this.recipes.length / this.recipesOnPage);
        for(let i = 0; i < calcPages; i++) { 
          arr.push(0); 
        }  
      }       
    } else if (finded.length > 0) {
        let calcPages = Math.ceil(finded.length / this.recipesOnPage);
        for(let i = 0; i < calcPages; i++) { 
          arr.push(0); 
        }     
    }
    return arr;
  } 

}
