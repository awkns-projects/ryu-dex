# Template-to-Record Generation Pattern

## What Is This Pattern?

This is the "factory pattern" where:
1. **Parent/Template Model** - Contains ideas/templates
2. **Child/Output Model** - Contains generated records
3. **to_many relationship** - Parent → Children
4. **to_one relationship** - Child → Parent
5. **Creation Action** - Targets parent, outputs to relationship field
6. **Enhancement Action** - Targets child, adds AI content

## Example: Blog Post Generator

### Parent Model: PostIdea
```typescript
{
  name: 'PostIdea',
  fields: [
    { name: 'title', type: 'text' },
    { name: 'template', type: 'textarea' },
    { name: 'frequency', type: 'enum', enumValues: ['daily', 'weekly'] },
    { name: 'last_generated', type: 'date' },
    { name: 'created_count', type: 'number' },
    { name: 'posts', type: 'reference', referenceType: 'to_many', referencesModel: 'Post' }
  ]
}
```

### Child Model: Post
```typescript
{
  name: 'Post',
  fields: [
    { name: 'title', type: 'text' },
    { name: 'content', type: 'textarea' },
    { name: 'status', type: 'enum', enumValues: ['draft', 'published'] },
    { name: 'post_idea', type: 'reference', referenceType: 'to_one', referencesModel: 'PostIdea' }
  ]
}
```

### Action 1: createPost (targets PostIdea)
```typescript
{
  name: 'createPost',
  targetModel: 'PostIdea',
  steps: [{
    outputFields: ['posts', 'last_generated', 'created_count']
    // 'posts' field creates new Post records!
  }]
}
```

### Action 2: generateContent (targets Post)
```typescript
{
  name: 'generateContent',
  targetModel: 'Post',
  steps: [{
    inputFields: ['title', 'post_idea'],
    outputFields: ['content', 'status']
  }]
}
```

## Templates to Add This Pattern

1. content-creator.ts - ContentIdea → ContentPiece
2. social-media-manager.ts - CampaignIdea → SocialPost
3. product-descriptions.ts - ProductTemplate → Product

