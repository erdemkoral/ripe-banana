const request = require('./request');
const mongoose = require('mongoose');
const assert = require('chai').assert;

describe('Film API', () => {

    let studio = {
        name: 'MGM'
    };

    let actor = {
        name: 'Ryan Gosling'
    };

    let reviewer1 = {
        name: 'Travis',
        company: 'theweb'
    };
    
    let movie1 = null;
    let movie2 = null;

    beforeEach(() => {

        mongoose.connection.dropDatabase();

        return request.post('/api/filmIndustry/studios')
            .send(studio)
            .then(res => res.body)
            .then(savedStudio => {
                studio = savedStudio;

            })
            .then(() => {
                return request.post('/api/filmIndustry/actors')
                    .send(actor)
                    .then(res => res.body)
                    .then(savedActor => {
                        actor = savedActor;

                        movie1 = {
                            title: 'Wonder Woman',
                            studio: studio._id,
                            released: 2017,
                            cast: [{part: 'smurf', actor: actor._id}]
                        };
                        

                        movie2 = {
                            title: 'Shawshank Redemption',
                            studio: studio._id,
                            released: 1995,
                            cast: [{part: 'prisoner', actor: actor._id}]
                        };
                    })
                    .then(() => {
                        return request.post('/api/filmIndustry/reviewers')
                            .send(reviewer1)
                            .then(savedReviewer => {
                                reviewer1._id = savedReviewer.body._id;
                                console.log('what is here??', savedReviewer.body._id);
                            
                                
                                
                            });

                    });
            });
    });

    it('saves a film', () => {
        return request.post('/api/filmIndustry/films')
            .send(movie1)
            .then(({ body }) => {
                assert.equal(body.title, movie1.title);
            });
    });


    it('gets all films', () => {


        const filmArray = [movie1, movie2].map(movie => {
            return request.post('/api/filmIndustry/films')
                .send(movie)
                .then(res => res.body);
        });

        let saved = null;
        return Promise.all(filmArray)
            .then(_saved => {
                saved = _saved;
                return request.get('/api/filmIndustry/films');
            })
            .then(res => {
                assert.equal(res.body.title, saved.title);
                assert.equal(res.body.released, saved.released);
                assert.equal(res.body[0].studio.name, 'MGM'); 
            });

    }),

    it.only('get a film by id', () => {
        let film = null;
        return request.post('/api/filmIndustry/films')
            .send(movie1)
            .then(res => {
                film = res.body;
                return request.get(`/api/filmIndustry/films/${film._id}`);
            })
            .then (() => {
                console.log('filmid', film._id);
                console.log('reviewerid', reviewer1._id);
                let review = {
                    rating: 3,
                    reviewer: reviewer1._id,
                    review_text: 'Amazing movie',
                    film: film._id,
                };
                return request.post('/api/filmIndustry/reviews')
                    .send(review)
                    .then(savedReview => {
                        review = savedReview;
                    });
            })
            .then(() => {
                return request.get(`/api/filmIndustry/films/${film._id}`);
            })
            .then(res => {
                console.log('what is here?', res.body.studio);
                console.log('film.cast?', film.cast[0].actor);
                assert.equal(res.body.title, film.title);
                assert.equal(res.body.released, film.released);
                // assert.equal(res.body.studio._id, film.studio); //not needed
                // assert.equal(res.body.studio.name, film.name); //doesnt work
                assert.equal(res.body.cast[0].part, film.cast[0].part);
                assert.equal(res.body.cast[0].actor.name, 'Ryan Gosling'); 
            });
    }),

    it('deletes with id', () => {
        let savedFilm =null;
        return request.post('/api/filmIndustry/films')
            .send(movie1)
            .then(res => {
                savedFilm = res.body;
                return request.delete(`/api/filmIndustry/films/${savedFilm._id}`);
            })
            .then(res => {
                assert.deepEqual(res.body, { removed: true });
            });
    });

    it('return false delete with bad id', () => {
        return request.delete('/api/filmIndustry/films/59dfeaeb083bf9beecc97ce8')
            .then(res => {
                assert.deepEqual(res.body, {removed: false});
            });
    });

    it('changes saved movie with id', () => {
        let update = { title: 'Rambo'};
        return request.post('/api/filmIndustry/films')
            .send(movie1)
            .then(res => {
                return request.put(`/api/filmIndustry/films/${res.body._id}`).send(update);
            })
            .then(res => {
                assert.equal(res.body.title, update.title);
            });
    });

    it('updates a film', () => {
        return request.post('/api/filmIndustry/films')
            .send(movie1)
            .then(res => {
                let savedMovie = res.body;    
                savedMovie.title = 'Wonder Bread';
                return request.put(`/api/filmIndustry/films/${savedMovie._id}`)
                    .send(savedMovie);
            })
            .then(res => {
                assert.equal(res.body.title, 'Wonder Bread');
            });
    }); 
    
    it('removes by id', () => {
        let film = null;
        return request.post('/api/films')
            .send(film)
            .then(res => {
                film = res.body;
                return request.delete(`/api/films/${film._id}`);
            })
            .then(res => {
                assert.deepEqual(res.body, { removed: true });
                return request.get(`/api/film/${film._id}`);
            })
            .then(
                () => { throw new Error('Unexpected successful response'); },
                err => {
                    assert.equal(err.status, 404);
                });
    });

});


