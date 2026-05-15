FROM nginx:alpine

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80 (Render detects this and routes external traffic to it)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
