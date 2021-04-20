<?php
error_reporting(E_ALL);

$servername = "sql-server";
$username = "root";
$password = "root";
$dbname = "recipes";

session_start();

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$conn->set_charset("utf8");
mysqli_set_charset($conn, 'utf-8');

$response = array();

if (isset($_GET["action"])) {
    $action = $_GET['action'];

    if (isset($_SESSION['username'])) {
        $response['logged'] = true;
        $response['username'] = $_SESSION['username'];
        if ($action == "get_recipes") {     
            $response['recipes'] = array();  
            
            $sql_get_recipes = "SELECT * FROM recipes";
            $result_get_recipes =  $conn->query($sql_get_recipes);
            
            if (mysqli_num_rows($result_get_recipes) > 0) {     
                while ($recipe = $result_get_recipes -> fetch_assoc()) {             
                    array_push($response['recipes'], $recipe);   
                }            
            } else {
                echo "0 results";
            }      
    
        }  else if ($action == "get_current_page_recipes") {                     
            $page = isset($_GET['page']) && is_numeric($_GET['page']) ? $_GET['page'] : 1;    
            $response['recipes'] = array();     
            $num_recipes_on_page = 9;  
            $total_recipes = $conn->query('SELECT COUNT(*) FROM recipes')->fetch_row()[0];
            $count_all_pages = ceil($total_recipes / $num_results_on_page);
            $sql_get_recipes = "SELECT * FROM recipes LIMIT " . $num_recipes_on_page * ($page-1) . "," . $num_recipes_on_page ;
            $result_get_recipes =  $conn->query($sql_get_recipes);
            
            if (mysqli_num_rows($result_get_recipes) > 0) {     
                while ($recipe = $result_get_recipes -> fetch_assoc()) {             
                    array_push($response['recipes'], $recipe);   
                }            
            } else {
                echo "0 results";
            }          
         
            $response['recipes_count'] =  $total_recipes;        
           
        } else if ($action == "add_recipe") {          
            $title = $_GET['title'];
            $description = $_GET['description'];
            $date = date("d.m.Y");    
            $ingredients = $_GET['ingredients'];            
            $difficulty = $_GET['difficulty'];
            $preparation = $_GET['preparation'];
            $portion = $_GET['portion'];  
          
            $sql = "INSERT INTO `recipes` (`title`, `description`, `data`, `picture`, `ingredients`, `pictures`, `difficulty`, `preparation`, `portion`) VALUES ('$title', '$description', '$date', ' ', '$ingredients', ' ', '$difficulty', '$preparation', '$portion')" ;      
            if ($conn->query($sql) === TRUE) {
                $last_id = $conn->insert_id;
            }

            $POST_DATA = json_decode(file_get_contents('php://input'), true);
            $response['post'] = $POST_DATA;

            for ($x = 1; $x <= 5; $x++) {
                $dataStr = $POST_DATA[$x-1]['image'];
                $response['new_image'] = $dataStr;
           
                if($dataStr != ""){
                    
                    if (preg_match('/^data:image\/(\w+);base64,/', $dataStr, $type)) {
                        $data = substr($dataStr, strpos($dataStr, ',') + 1);
                        $type = strtolower($type[1]); 
                        $response['data'] = $data;
                        $response['type'] = $type;
                        if (!in_array($type, [ 'jpg', 'jpeg', 'gif', 'png' ])) {
                            throw new \Exception('invalid image type');
                        }
                        $dataDec = base64_decode($data);
                        if ($dataDec === false) {
                            throw new \Exception('base64_decode failed');
                        }
                      
                        file_put_contents("../assets/images/recipe-".$last_id."-image".$x.".{$type}", $dataDec);
                    } 
                 
                }
            }    
           
        } else if ($action == "edit_recipe") {      
            $uid = $_GET['uid'];   
            $title = $_GET['title'];
            $description = $_GET['description'];
            $date = date("d.m.Y");     
            $ingredients = $_GET['ingredients'];              
            $items = explode(' ', $ingredients);      
            $items_json = json_encode($items);
            $response['items_json'] = $items_json;
            $difficulty = $_GET['difficulty'];
            $preparation = $_GET['preparation'];
            $portion = $_GET['portion'];                
            $sql = "UPDATE `recipes` SET `title`='" . $title . "',`description`='" . $description . "', `ingredients`='" . $ingredients . "', `difficulty`='" . $difficulty . "',`preparation`='" . $preparation . "', `portion`='" . $portion . "' WHERE `uid` = " . $uid;
          
            $result = $conn->query($sql);  

            $POST_DATA = json_decode(file_get_contents('php://input'), true);
            $response['post'] = $POST_DATA;

            for ($x = 1; $x <= 5; $x++) {
                $dataStr = $POST_DATA[$x-1]['image'];
                $response['new_image'] = $dataStr;
           
                if($dataStr != ""){
                    
                    if (preg_match('/^data:image\/(\w+);base64,/', $dataStr, $type)) {
                        $data = substr($dataStr, strpos($dataStr, ',') + 1);
                        $type = strtolower($type[1]); 
                        $response['data'] = $data;
                        $response['type'] = $type;
                        if (!in_array($type, [ 'jpg', 'jpeg', 'gif', 'png' ])) {
                            throw new \Exception('invalid image type');
                        }
                        $dataDec = base64_decode($data);
                        if ($dataDec === false) {
                            throw new \Exception('base64_decode failed');
                        }
                      
                        file_put_contents("../assets/images/recipe-".$uid."-image".$x.".{$type}", $dataDec);
                    } 
                 
                }
            }    

        } else if ($action == "delete_recipe") {   
            $uid = $_GET['uid'];            
            $sql = "DELETE FROM `recipes` WHERE `uid` = '$uid'" ;      
            $result = $conn->query($sql); 

        } else if ($action == "logout") {
            $_SESSION = array(); 
            session_destroy();
            $response['logged'] = false;
            
        }
    } else {
        $response['logged'] = false;
        if ($action == "login") {
            $username = $_GET['username'];
            $password = $_GET['password']; 
         
            $sql = "SELECT * FROM `admin` WHERE `username`='$username' AND `password`='$password'" ;
            $result = $conn->query($sql);
            if ($result) {
                if ($result -> num_rows > 0) {
                    $row_user = $result ->fetch_assoc();
                    $_SESSION['username'] = $row_user['username'];
                    $response['username'] = $row_user['username'];
                    $response['name'] = $row_user['name'];
                    $response['logged'] = true;
                }
            }       
        }
    }
    
} 

echo json_encode($response);
$conn->close();

?>
