import { Post } from "./post.model";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { map } from "rxjs/Operators";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root"
})
export class PostService {
  private posts: Post[] = [];
  private postUpdated = new Subject<{ posts: Post[]; postCount: number }>();

  constructor(private http: HttpClient, private router: Router) {}
  getPosts(postsPerPage: number, page: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${page}`;
    this.http
      .get<{ message: String; posts: any[]; maxPosts: number }>(
        "http://localhost:3000/api/posts" + queryParams
      )
      .pipe(
        map(postData => {
          return {
            posts: postData.posts.map(post => {
              return {
                id: post._id,
                title: post.title,
                content: post.content,
                imagePath: post.imagePath
              };
            }),
            maxPosts: postData.maxPosts
          };
        })
      )
      .subscribe(transformedPosts => {
        this.posts = transformedPosts.posts;
        this.postUpdated.next({
          posts: [...this.posts],
          postCount: transformedPosts.maxPosts
        });
      });
  }

  getPostUpdateListner() {
    return this.postUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      imagePath: string;
    }>("http://localhost:3000/api/posts/" + id);
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();

    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title);
    this.http
      .post<{ message: string; post: Post }>(
        "http://localhost:3000/api/posts",
        postData
      )
      .subscribe(responseData => {
        this.router.navigate(["/"]);
      });
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof image === "object") {
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image
      };
    }

    this.http
      .put<{ message: string; postId: string }>(
        "http://localhost:3000/api/posts/" + id,
        postData
      )
      .subscribe(responseData => {
        this.router.navigate(["/"]);
      });
  }

  deletePost(id: string) {
    return this.http.delete("http://localhost:3000/api/posts/" + id);
  }
}
