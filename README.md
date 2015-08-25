# Vault Frontend Distribution

Compiled frontend part of [Vault](https://github.com/private-vault/vault) project.

## Production use

To use this code for production, set up Vault backend and serve `dist` folder with your preferred web server. Example configuration for nginx:

    server {
       listen          443 ssl;
       server_name     vault.com;
    
       set $vault_backend "/home/vault/vault/api/public"; # path of Vault backend public dir
    
       root /home/vault/vault-front-dist/dist; # path of this repository
       index index.html;
    
       ssl on;
       ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
       ssl_certificate /home/vault/vault.cert;
       ssl_certificate_key /home/vault/vault.key;
    
       location /api {
           root $vault_backend;
           index index.php;
           try_files $uri $uri/ /index.php?$args;
       }
    
       location /internal {
           root $vault_backend; 
           index index.php;
           try_files $uri $uri/ /index.php?$args;
       }
    
       location / {
           index index.html;
           try_files $uri $uri/ /index.html;
       }
    
       location ~ \.php$ {
           include /etc/nginx/fastcgi_params;
           fastcgi_pass 127.0.0.1:9000;
           fastcgi_param SCRIPT_FILENAME $vault_backend/$fastcgi_script_name;
           fastcgi_buffers 8 16k;
           fastcgi_buffer_size 32k;
           fastcgi_read_timeout 60s;
       }
    
       location ~* \.(?:ico|css|js|jpe?g|JPG|png|svg|woff)$ {
           expires 365d;
       }
    }


### To compile for latest changes, run:

    git pull origin master && npm install && node dist
