import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import { Post } from "./../post.model";
import { PostService } from "../post.service";
import { Subscription } from "rxjs";
import { PageEvent } from "@angular/material";
import { AuthService } from "src/app/auth/auth.service";

@Component({
  selector: "app-post-list",
  templateUrl: "./post-list.component.html"
})
export class PostListComponent implements OnInit, OnDestroy {
  // posts = [
  //   {title: 'first post', content: 'this is first post content'},
  //   {title: 'second post', content: 'this is second post content'},
  //   {title: 'third post', content: 'this is third post content'}
  // ];
  posts: Post[] = [];
  private postSub: Subscription;
  isLoading = false;
  totalPosts = 10;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 3, 5, 10];

  useIsAuthenticated = false;

  private authStatusListenerSubs: Subscription;

  constructor(
    public postService: PostService,
    private authService: AuthService
  ) {}
  ngOnInit() {
    this.isLoading = true;
    this.postService.getPosts(this.postsPerPage, 1);
    this.postSub = this.postService
      .getPostUpdateListner()
      .subscribe((postData: { posts: Post[]; postCount: number }) => {
        this.isLoading = false;
        this.totalPosts = postData.postCount;
        this.posts = postData.posts;
      });

      this.useIsAuthenticated =  this.authService.getAuth();

    this.authStatusListenerSubs = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticates => {
        this.useIsAuthenticated = isAuthenticates;
      });
  }
  onDelete(id: string) {
    this.isLoading = true;

    this.postService.deletePost(id).subscribe(() => {
      this.postService.getPosts(this.postsPerPage, this.currentPage);
    });
  }

  onChangedPage(pageEvent: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageEvent.pageIndex + 1;
    this.postsPerPage = pageEvent.pageSize;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
  }
  ngOnDestroy() {
    this.postSub.unsubscribe();
  }
}
